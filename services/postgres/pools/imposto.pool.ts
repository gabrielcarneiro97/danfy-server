import Pool from './pool';

import {
  pgType, // eslint-disable-line no-unused-vars
} from '../models/table.model';

import Imposto from '../models/imposto.model';
import Icms from '../models/icms.model';

export default class ImpostoPool extends Pool {
  imposto : Imposto;
  icms : Icms;

  constructor(imposto : Imposto, icms : Icms) {
    super([imposto, icms]);

    this.imposto = imposto;
    this.icms = icms;
  }

  async save() {
    const icmsId = <number> await this.icms.save();
    this.imposto.icmsId = icmsId;

    return this.imposto.save();
  }

  soma(impostoPool : ImpostoPool) {
    this.imposto.soma(impostoPool.imposto);
    this.icms.soma(impostoPool.icms);
  }

  async del() {
    await this.icms.del();
    return this.imposto.del();
  }

  static async getById(id : pgType) {
    const [imposto] = await Imposto.getBy({ id });
    const [icms] = await Icms.getBy('id', imposto.icmsId.toString());

    return new ImpostoPool(imposto, icms);
  }
}
