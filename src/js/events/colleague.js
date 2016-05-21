var Colleague = (function(){
  function Colleague(mediator, component){
    this.mediator = mediator;
    this.callbacks = {};
    this.mediator.register(this);
    this.mediation.component = component;
    this.mediation.events = {
      broadcast:{ gupdate: this._constructEventString(Events.scope.broadcast, Events.desc.update.global) },
      emit: { gupdate: this._constructEventString(Events.scope.emit, Events.desc.update.global) }
    };
  }

  Colleague.prototype.constructor = Colleague;

  //Component for Event Strings
  Colleague.prototype.component = 'COLLEAGUE';

  Colleague.prototype.enum = {
    callbacks: {
      notify: "notify",
      emit: "emit"
    }
  };

  Colleague.prototype.registerCallback = function (name, callback) {
    var exists = false,
        callbacks;
    if(this.enum.callbacks !== undefined){
      callbacks = [this.enum.callbacks, Colleague.prototype.enum.callbacks];
    }else{
      callbacks = [Colleague.prototype.enum.callbacks];
    }
    for(var i = 0; i < callbacks.length; i++){
      for(var key in callbacks[i]){
        if(key === name){
          exists = true;
          break;
        }
      }
    }
    if(exists && typeof callback === "function"){
      if(this.callbacks[name] === undefined) this.callbacks[name] = [];
      this.callbacks[name].push(callback);
      return true;
    }else{
      return false;
    }
  };

  Colleague.prototype.callCallback = function (name, data) {
    if(name === undefined) throw new Error();
    var index;
    index = this.enum.callbacks !== undefined ? this.enum.callbacks[name] : undefined;
    index = index === undefined ? Colleague.prototype.enum.callbacks[name] : index;
    if(this.callbacks[index] !== undefined){
      for (var i = 0; i < this.callbacks[index].length; i++) {
        this.callbacks[index][i].call(this, data);
      }
    }
  };

  Colleague.prototype.emit = function (eventStr, data) {
    var e = {
          name: eventStr,
          source: this.mediation.component + ':' + this.mediation.uuid,
          data: data
        };

    if(eventStr.indexOf(Events.scope.emit) !== -1){
      e.scope = Events.scope.emit;
    }else if(eventStr.indexOf(Events.scope.broadcast) !== -1){
      e.scope = Events.scope.broadcast;
    }
    var desc = eventStr, index = desc.indexOf('_');
    while(index !== -1){
        desc = desc.substring(index+1);
        index = desc.indexOf('_');
    }
    e.desc = desc;
    this.mediator.notify(this, e);
    this.callCallback(Colleague.prototype.enum.callbacks.emit, e);
  };

  Colleague.prototype.notify = function (e) {
    this.callCallback(Colleague.prototype.enum.callbacks.notify, e);
  };

  Colleague.prototype._constructEventString = function (scope, desc) {
    return this.mediation.component + ':' + this.mediation.uuid + '_' + scope + '_' + desc;
  };

  return Colleague;
})();
