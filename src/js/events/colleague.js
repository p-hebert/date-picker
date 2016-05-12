var Colleague = (function(){
  function Colleague(mediator){
    this.mediator = mediator;
    this.callbacks = {};
  }

  Colleague.prototype.constructor = Colleague;

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
    this.mediator.notify(eventStr, this, data);
    this.callCallback(Colleague.prototype.enum.callbacks.emit, {name: eventStr, source: this, data: data});
  };

  Colleague.prototype.notify = function (e) {
    this.callCallback(Colleague.prototype.enum.callbacks.notify, e);
  };

  return Colleague;
})();
