import { HxlFilter } from './ingredients';

import { Ingredient, BiteFilters } from './ingredient';
export abstract class Bite {

  // error encountered while processing the bite
  public errorMsg: string;

  // ingredient generated by cookbook generator, needed by recipe service
  public ingredient: Ingredient;
  // HXL Proxy generated: column name
  // public title: string;
  // HXL Proxy generated: hxl tag

  // contains properties that are automatically generated
  public computedProperties: ComputedProperties;

  // contains properties that are populated from the UI
  public uiProperties: UIProperties;


  // data from hxl proxy
  public dataProperties: DataProperties;

  // internal to know what type of bite we have inside the template :)
  public type: string;

  public hashCode: number;

  // Timeseries or Charts or Key Figures
  public displayCategory: string;

  public tempShowSaveCancelButtons = false;


  static type(): string {
    return 'bite';
  }

  constructor(ingredient: Ingredient) {
    this.ingredient = ingredient;
    this.type = (this.constructor as typeof Bite).type();
    this.errorMsg = null;
  }

  // public setTitle(title: string) {
  //   // this.title = title.slice(0, 35) + (title.length > 35 ? '...' : '');
  //   this.title = title;
  // }

}

export class ComputedProperties {
  title: string;
  dataTitle: string;
}

export class UIProperties {
  title: string;
  description: string;
  dataTitle: string;

  internalColorPattern: string[];
}

/**
 * Data coming from the hxl proxy (processed maybe for showing in the charts)
 */
export class DataProperties {
}
