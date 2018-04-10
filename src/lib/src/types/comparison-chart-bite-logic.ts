import {BiteLogic, ColorUsage} from './bite-logic';
import {
    ComparisonChartBite,
    ComparisonChartComputedProperties,
    ComparisonChartDataProperties,
    ComparisonChartUIProperties
} from './comparison-chart-bite';
import { ChartBiteLogic } from './chart-bite-logic';

export class ComparisonChartBiteLogic extends ChartBiteLogic {

  constructor(protected bite: ComparisonChartBite) {
    super(bite);
  }

  protected buildImportantPropertiesList(): string[] {
    const importantProperties = super.buildImportantPropertiesList();
    importantProperties.push(this.bite.ingredient.comparisonValueColumn, this.bite.ingredient.comparisonOperator);
    return importantProperties;
  }

  public populateWithHxlProxyInfo(hxlData: any[][], tagToTitleMap: any): ComparisonChartBiteLogic {
    super.populateWithHxlProxyInfo(hxlData, tagToTitleMap);
    this.computedProperties.pieChart = false;

    const valColIndex = this.findHxlTagIndex(this.bite.ingredient.valueColumn, hxlData);
    const compColIndex = this.findHxlTagIndex(this.bite.ingredient.comparisonValueColumn, hxlData);

    if ( compColIndex >= 0) {
      this.dataProperties.comparisonValues = [this.bite.ingredient.comparisonValueColumn];

      for (let i = 2; i < hxlData.length; i++) {
        let computedValue = hxlData[i][compColIndex];

        // If we have more than 1 row of data
        // if (hxlData.length > 3) {
        //   computedValue = computedValue - hxlData[i][valColIndex];
        // }

        this.dataProperties.comparisonValues.push(computedValue);
      }
    } else {
      throw new Error(`${this.bite.ingredient.comparisonValueColumn}` + ' not found in hxl proxy response');
    }

    return this;
  }

  protected populateDataTitleWithHxlProxyInfo(): BiteLogic {
    super.populateDataTitleWithHxlProxyInfo();
      let computedProperties: ComparisonChartComputedProperties = (<ComparisonChartComputedProperties>this.bite.computedProperties);
      if (!computedProperties.comparisonDataTitle) {
          let ingredient = this.bite.ingredient;
          computedProperties.comparisonDataTitle = ingredient.comparisonValueColumn;
      }
    return this;
  }


  public populateWithTitle(columnNames: string[], hxlTags: string[]): BiteLogic {
    super.populateWithTitle(columnNames, hxlTags);
    let computedProperties: ComparisonChartComputedProperties = (<ComparisonChartComputedProperties>this.bite.computedProperties);
    const availableTags = {};
    hxlTags.forEach((v, idx) => availableTags[v] = idx);

    let ingrValColumn = this.bite.ingredient.comparisonValueColumn;
    const valueColumn = columnNames[availableTags[ingrValColumn]];
    const hxlValueColumn = hxlTags[availableTags[ingrValColumn]];
    computedProperties.comparisonDataTitle = (valueColumn && valueColumn.length > 0 ) ? valueColumn : hxlValueColumn;
    return this;
  }

  public initUIProperties(): ComparisonChartUIProperties {
    return new ComparisonChartUIProperties();
  }

  public initDataProperties(): ComparisonChartDataProperties {
    return new ComparisonChartDataProperties();
  }

  public colorUsage(): ColorUsage {
    return ColorUsage.MANY;
  }

  public get dataProperties(): ComparisonChartDataProperties {
    return this.bite.dataProperties as ComparisonChartDataProperties;
  }

  public get uiProperties(): ComparisonChartUIProperties {
    return this.bite.uiProperties as ComparisonChartUIProperties;
  }

  public get valueColumns(): string[] {
    return [
      this.bite.ingredient.valueColumn,
      this.bite.ingredient.comparisonValueColumn
    ];
  }

  public get comparisonValues(): any[] {
    return this.dataProperties.comparisonValues;
  }

  public get stackChart(): boolean {
    return this.uiProperties.stackChart;
  }

  public get comparisonDataTitle(): string {
    let uiProperties: ComparisonChartUIProperties = (<ComparisonChartUIProperties>this.bite.uiProperties);
    let computedProperties: ComparisonChartComputedProperties = (<ComparisonChartComputedProperties>this.bite.computedProperties);
    const comparisonDataTitle = uiProperties.comparisonDataTitle || computedProperties.comparisonDataTitle;
    return comparisonDataTitle;
  }

  public get comparisonColor(): string {
    return this.uiProperties.comparisonColor;
  }

}
