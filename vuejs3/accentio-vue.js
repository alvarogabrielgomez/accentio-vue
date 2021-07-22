class AccentioReactive {
    // Dependencias
    deps = new Map();
    appEl;

    constructor(options) {
        const self = this;

        this.origen = options.data();
        // Destino
        this.$data = new Proxy(this.origen, {
            get(target, name) {
                if (Reflect.has(target, name)) {
                    self.track(target, name);
                    return Reflect.get(target, name);
                }
                console.warn(`Propiedad ${name} no existe dentro de ${target.constructor.name}`);
                return '';
            },
            set(target, name, value) {
                Reflect.set(target, name, value);
                self.trigger(name)
            }
        });
    }

    track(target, name) {
        if(!this.deps.has(name)) {
            const effect = () => {
                this.appEl.querySelectorAll("*").forEach(el => {
                    const attributes = el.attributes;
                    for (let i = 0; i < attributes.length; i++) {
                        const att = attributes[i];

                        if(att.name === "a-text" && att.value === name) {
                            this.aText(el, this.$data, name);
                        }

                        if(att.name.startsWith("a-bind:") && att.value === name) {
                            this.abind(el, this.$data, att, name);
                        }
                    }
                });
            }
            this.deps.set(name, effect);
        }
    }
    trigger(name) {
        const effect = this.deps.get(name);
        effect();
    }
    mount(appId) {
        this.appEl = document.querySelector(appId);
        this.appEl.querySelectorAll("*").forEach(el => {
            const attributes = el.attributes;

            for (let i = 0; i < attributes.length; i++) {
                const att = attributes[i];
                const attName = att.name;

                if(attName.startsWith("a-bind:")) {
                    const name = att.value;
                    this.abind(el, this.$data, att, name);
                }

                if(attName === "a-text") {
                    const name = att.value;
                    this.aText(el, this.$data, name);
                }

                if(attName === "a-model") {
                    const name = att.value;
                    this.aModel(el, this.$data, name);
                    el.addEventListener("input", () => {
                        Reflect.set(this.$data, name, el.value);
                    });
                }
            }

        });
    }
    aText(el, target, name) {
        el.innerText = Reflect.get(target, name);
    }
    aModel(el, target, name) {
        el.value = Reflect.get(target, name);
    }
    abind(el, target, att, name) {
        // el[target][name] = Reflect.get(target, name);
        const bindedAtt = att.name.replace("a-bind:", "");
        el.setAttribute(bindedAtt, Reflect.get(target, name));
        
    }
}
var AccentioVue = {
    createApp(options) {
        return new AccentioReactive(options);
    }
}