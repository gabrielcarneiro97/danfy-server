import Table from '../models/table.model';

export default class Pool {
  constructor(objs : any[]) {
    const not = objs.find((o) => !(o instanceof Table) && !(o instanceof Pool));

    if (not) throw new Error('Todos os elementos da Pool devem ser instancias de Pool ou de Table!');
  }

  async save() : Promise<any> {
    return this;
  }
}
