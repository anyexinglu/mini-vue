export class MiniVue {
  constructor(config) {
    const { data, el, methods } = config;
    this.effects = new Map();
    // data 做双向绑定，挂到 this 上
    this.data = reactive.bind(this)(data);
    this.template = document.querySelector(el);
    // 方法挂到 this 上
    Object.keys(methods).forEach(key => {
      this[key] = (...params) => {
        methods[key].bind(this.data)(...params);
      };
    });
    // template 内容替换
    this.traverse(this.template);
    console.log("...this", this);
  }

  traverse(dom) {
    if (dom.nodeType === Node.TEXT_NODE) {
      if (dom.data) {
        dom.data = dom.data.replace(/{{(.*)}}/, ($0, $1) => {
          const key = $1.trim();
          if (!this.effects.get(key)) {
            this.effects.set(key, []);
          }
          this.effects.get(key).push((value, oldValue) => {
            console.log("....handler", value, oldValue);
            dom.data = value; // TODO hard code 需要改
          });
          return Reflect.get(this.data, key);
        });
      }
    }
    if (dom.attributes) {
      for (let item of dom.attributes) {
        let { name, value } = item;
        if (name.startsWith("v-on")) {
          let event = name.replace("v-on:", "");
          dom.addEventListener(event, this[value]);
        }
      }
    }
    if (dom.childNodes) {
      Array.from(dom.childNodes).forEach(child => {
        this.traverse(child);
      });
    }
  }
}

function reactive(data) {
  return new Proxy(data, {
    get: (obj, key, value) => {
      return data[key];
    },
    set: (obj, key, value) => {
      let oldValue = data[key];
      data[key] = value;
      if (this.effects.get(key)) {
        this.effects.get(key).forEach(handler => {
          handler(value, oldValue);
        });
      }
      return true;
    },
  });
}
