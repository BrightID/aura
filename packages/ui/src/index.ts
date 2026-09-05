const define = CustomElementRegistry.prototype.define;
CustomElementRegistry.prototype.define = function (
  this: CustomElementRegistry,
  name: string,
  ctor: CustomElementConstructor,
  options?: ElementDefinitionOptions,
) {
  if (this.get(name)) return;
  return define.call(this, name, ctor, options);
};

export * from './components';
