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
    var exists = false;
    for(var key in Colleague.prototype.enum.callbacks){
      if(key === name){
        exists = true;
        break;
      }
    }
    if(exists && typeof callback === "function"){
      this.callbacks[name] = callback;
      return true;
    }else{
      return false;
    }
  };

  Colleague.prototype.callCallback = function (name, data) {
    var index = Colleague.prototype.enum.callbacks[name];
    if(this.callbacks[index] !== undefined){
      this.callbacks[index].call(this, data);
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
