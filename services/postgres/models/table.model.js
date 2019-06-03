const { pg } = require('../../pg.service');

class Table {
  constructor(obj, isSnake, Cl) {
    if (isSnake) {
      Cl.columns().forEach((column) => {
        const camel = Table.toCamel(column);
        this[camel] = obj[column];
      });
    } else {
      Object.keys(obj).forEach((key) => {
        const snake = Table.toSnake(key);
        if (Cl.columns().includes(snake)) {
          this[key] = obj[key];
        }
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
  static toCamel(s) {
    return s.replace(/([-_][a-z])/ig, $1 => $1.toUpperCase().replace('-', '').replace('_', ''));
  }
  static toSnake(s) {
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

  static async getBy(column, value, Cl) {
    if (!Cl.columns().includes(column)) {
      throw new Error('Coluna não econtrada!');
    } else {
      return new Promise((resolve, reject) => {
        pg.select('*').from(Cl.tbName()).where({ [column]: value }).then(([pgObj]) => {
          resolve(new Cl(pgObj, true));
        })
          .catch(reject);
      });
    }
  }

  snakeObj() {
    const obj = {};
    Object.keys(this).forEach((key) => {
      const snake = Table.toSnake(key);
      obj[snake] = this[key];
    });

    return obj;
  }

  static save(obj, Cl) {
    return new Promise((resolve, reject) => {
      const update = () => {
        pg.table(Cl.tbName())
          .update(obj.snakeObj(), Cl.tbUK())
          .where({ [Cl.tbUK()]: obj[Cl.tbUK()] })
          .then(resolve)
          .catch(reject);
      };

      const insert = () => {
        pg.table(Cl.tbName())
          .insert(obj.snakeObj(), Cl.tbUK())
          .then(resolve)
          .catch(reject);
      };

      if (obj[Cl.tbUK()]) {
        pg.select(Cl.tbUK())
          .from(Cl.tbName())
          .where({ [Cl.tbUK()]: obj[Cl.tbUK()] })
          .then(([pgObj]) => {
            if (pgObj) {
              update();
            } else {
              insert();
            }
          })
          .catch(reject);
      } else {
        insert();
      }
    });
  }
}

module.exports = Table;
