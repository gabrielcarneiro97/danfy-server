import { pg } from '../../pg.service';

export type pgStr = string | null;
export type pgNum = number | null;
export type pgDate = Date | null;
export type pgBool = boolean | null;

export type pgType = pgStr | pgNum | pgDate | pgBool;

interface ITable {
  new (obj: Table, isSnake: boolean, Cl?: ITable) : Table;
  tbName() : string;
  tbUK() : string;
  columns() : string[];
}

export default class Table {
  constructor(obj? : object, isSnake? : boolean, Cl? : ITable) {
    if (!obj) {
      Cl.columns().forEach((column) => {
        const camel = Table.toCamel(column);
        this[camel] = null;
      });
    } else if (isSnake) {
      Cl.columns().forEach((column) => {
        const camel = Table.toCamel(column);
        this[camel] = obj[column] || null;
      });
    } else {
      Cl.columns().forEach((column) => {
        const camel = Table.toCamel(column);
        this[camel] = obj[camel] || null;
      });
    }
  }

  static tbName() {
    return '';
  }

  static tbUK() {
    return '';
  }

  static columns() {
    return [];
  }

  static toCamel(s: string) : string {
    return s.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
  }

  static toSnake(s: string) : string {
    const upperChars = s.match(/([A-Z])/g);
    if (!upperChars) {
      return s;
    }

    let str = s.toString();
    for (let i = 0, n = upperChars.length; i < n; i += 1) {
      str = str.replace(new RegExp(upperChars[i]), `_${upperChars[i].toLowerCase()}`);
    }

    if (str.slice(0, 1) === '_') {
      str = str.slice(1);
    }

    return str;
  }

  static async getBy(column : string | object, value? : string) : Promise<any> {
    return value;
  }

  static async getty<T extends Table>(param1 : string | object,
    param2? : string, param3? : ITable) {
    const select = async (obj, Cl) : Promise<T[]> => {
      const arr = await pg.select('*').from(Cl.tbName()).where(obj);
      return arr.map((o) => new Cl(o, true));
    };

    if (typeof param1 === 'string') {
      const column = param1;
      const value = param2;
      const Cl = param3;

      if (!Cl.columns().includes(column)) {
        throw new Error('Coluna não econtrada!');
      } else {
        return select({ [column]: value }, Cl);
      }
    } else if (typeof param1 === 'object') {
      if (Array.isArray(param1)) {
        throw new Error('Tipo não suportado!');
      } else {
        const obj = Table.objToSnake(param1);
        const Cl = param3;

        const err = Object.keys(obj).find((k) => !Cl.columns().includes(k));

        if (err) throw new Error(`Coluna ${err} não encontrada!`);
        else return select(obj, Cl);
      }
    } else {
      throw new Error('Tipo não suportado!');
    }
  }

  snakeObj() {
    return Table.objToSnake(this);
  }

  static objToSnake(objParam) {
    const obj = {};
    Object.keys(objParam).forEach((key) => {
      const snake = Table.toSnake(key);
      obj[snake] = objParam[key];
    });

    return obj;
  }

  static async save(obj : Table, Cl : ITable) {
    const update = async () => {
      const [uk] = await pg.table(Cl.tbName())
        .update(obj.snakeObj(), Cl.tbUK())
        .where({ [Cl.tbUK()]: obj[this.toCamel(Cl.tbUK())] });
      return <pgType> uk;
    };

    const insert = async () => {
      if (obj[this.toCamel(Cl.tbUK())] === null) {
        delete obj[this.toCamel(Cl.tbUK())]; // eslint-disable-line no-param-reassign
      }

      const [uk] = await pg.table(Cl.tbName()).insert(obj.snakeObj(), Cl.tbUK());

      obj[this.toCamel(Cl.tbUK())] = uk; // eslint-disable-line no-param-reassign

      return <pgType> uk;
    };

    if (obj[this.toCamel(Cl.tbUK())]) {
      const [pgObj] = await pg.select(Cl.tbUK())
        .from(Cl.tbName())
        .where({ [Cl.tbUK()]: obj[this.toCamel(Cl.tbUK())] });
      if (pgObj) {
        return update();
      }
      return insert();
    }
    return insert();
  }

  static async del(obj : Table, Cl : ITable) : Promise<pgType> {
    return pg.table(Cl.tbName()).where({ [Cl.tbUK()]: obj[this.toCamel(Cl.tbUK())] }).del();
  }
}
