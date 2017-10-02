import { Injectable } from '@angular/core';
import { BiteConfig } from '../types/bite-config';
import { HxlproxyService } from './hxlproxy.service';
import { Bite } from '../types/bite';
import { ChartBite } from '../types/chart-bite';
import { KeyFigureBite } from '../types/key-figure-bite';
import { Http, Response } from '@angular/http';
import { BiteLogicFactory } from '../types/bite-logic-factory';
import { AggregateFunctionOptions } from '../types/ingredients';
import { Observable } from 'rxjs/Observable';
import { TimeseriesChartBite } from '../types/timeseries-chart-bite';
import { MyLogService } from './mylog.service';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/Rx';

@Injectable()
export class CookBookService {

  private config: { [s: string]: string; } = {};

  private cookBooks: string[];

  constructor(private logger: MyLogService, private hxlproxyService: HxlproxyService, private http: Http) {
    this.cookBooks = [
      // 'assets/bites-chart.json',
      // 'assets/bites-key-figure.json',
      'assets/bites.json',
    ];
  }

  private hxlMatcher(generalColumn: string, dataColumn: string): boolean {
    if (generalColumn === dataColumn) {
      return true;
    }
    return dataColumn.startsWith(generalColumn + '+');
  }

  private matchInSet(dataColumn: string, recipeColumns: string[]): boolean {
    return recipeColumns.filter(column => this.hxlMatcher(column, dataColumn)).length !== 0;
  }

  private determineAvailableBites(columnNames: Array<string>, hxlTags: Array<string>,
                                  biteConfigs: Array<BiteConfig>): Observable<Bite> {

    const bites: Observable<Bite> = new Observable<Bite>(observer => {
      biteConfigs.forEach((biteConfig) => {
        const aggregateColumns: Array<string> = [];
        const valueColumns = biteConfig.ingredients.valueColumns;

        const dateColumns: Array<string> = [];

        let aggregateFunctions: AggregateFunctionOptions[] = biteConfig.ingredients.aggregateFunctions;
        if ( !aggregateFunctions || aggregateFunctions.length === 0 ) {
          aggregateFunctions = ['sum'];
        }


        let avAggCols: string[] = [];
        if (biteConfig.ingredients.aggregateColumns) {
          biteConfig.ingredients.aggregateColumns.forEach(col => {
            if (!(biteConfig.type === 'timeseries' && col.indexOf('#date') >= 0)) {
              aggregateColumns.push(col);
            }
          });

          // filter the available hxlTags, and not the recipe general tags
          avAggCols = hxlTags.filter(col => this.matchInSet(col, aggregateColumns));
          // avAggCols = aggregateColumns.filter(col => this.matchInSet(col, hxlTags));
        }

        let avValCols: string[] = [];
        if (valueColumns) {
          // filter the available hxlTags, and not the recipe general tags
          avValCols = hxlTags.filter(col => this.matchInSet(col, valueColumns));
          // avValCols = valueColumns.filter(col => this.matchInSet(col, hxlTags));
        }

        if (biteConfig.type === 'timeseries') {
          hxlTags.forEach(col => {
            if (col.indexOf('#date') >= 0) {
              dateColumns.push(col);
            }
          });
        }

        this.logger.info(valueColumns);

        switch (biteConfig.type) {
          case TimeseriesChartBite.type():
            dateColumns.forEach(dateColumn => {
              aggregateFunctions.forEach(aggFunction => {
                /* For count function we don't need value columns */
                const modifiedValueColumns = aggFunction === 'count' ? ['#count'] : avValCols;
                modifiedValueColumns.forEach(val => {
                  const simple_bite = new TimeseriesChartBite(dateColumn, null, val, aggFunction);
                  BiteLogicFactory.createBiteLogic(simple_bite).populateHashCode()
                    .populateWithTitle(columnNames, hxlTags);
                  observer.next(simple_bite);
                  avAggCols.forEach(agg => {
                    const multiple_data_bite = new TimeseriesChartBite(dateColumn, agg, val, aggFunction);
                    BiteLogicFactory.createBiteLogic(multiple_data_bite).populateHashCode()
                      .populateWithTitle(columnNames, hxlTags);
                    observer.next(multiple_data_bite);
                  });
                });
              });
            });

            break;
          case ChartBite.type():
            aggregateFunctions.forEach(aggFunction => {
              avAggCols.forEach((agg) => {

                /* For count function we don't need value columns */
                const modifiedValueColumns = aggFunction === 'count' ? ['#count'] : avValCols;
                modifiedValueColumns.forEach(val => {
                  const bite = new ChartBite(agg, val, aggFunction);
                  BiteLogicFactory.createBiteLogic(bite).populateHashCode().populateWithTitle(columnNames, hxlTags);
                  observer.next(bite);
                });
              });
            });
            break;
          case KeyFigureBite.type():
            aggregateFunctions.forEach(aggFunction => {
              /* For count function we don't need value columns */
              const modifiedValueColumns = aggFunction === 'count' ? ['#count'] : avValCols;
              modifiedValueColumns.forEach(val => {
                const bite = new KeyFigureBite(val, aggFunction);
                BiteLogicFactory.createBiteLogic(bite).populateHashCode().populateWithTitle(columnNames, hxlTags);
                observer.next(bite);
              });
            });
            break;
        }
      });
      observer.complete();
    });

    return bites;
  }

  load(url: string, recipeUrl: string): Observable<Bite> {

    // if user is using an external recipe, provided as url
    if ( typeof recipeUrl !== 'undefined' ) {
      this.logger.info('Using external recipe from: ' + recipeUrl);
      this.cookBooks = [recipeUrl];
    }

    const cookBooksObs: Array<Observable<Response>> = this.cookBooks.map(book => this.http.get(book));
    const biteConfigs: Observable<BiteConfig[]> = cookBooksObs
      .reduce((prev, current, idx) => prev.merge(current))
      .flatMap((res: Response) => res.json())
      .map((biteConfig) => <BiteConfig>biteConfig)
      .toArray();
      // .subscribe(json => console.log(json);
    const metaRows = this.hxlproxyService.fetchMetaRows(url);

    const bites: Observable<Bite> = Observable.forkJoin(
      biteConfigs,
      metaRows
    )
      .flatMap(
        res => {
          const configs: BiteConfig[] = res[0];
          const rows = res[1];
          const columnNames: string[] = rows[0];
          const hxlTags: string[] = rows[1];

          return this.determineAvailableBites(columnNames, hxlTags, configs);
        }
      );

    bites.subscribe(bite => this.logger.log(bite));

    return bites;
  }

}
