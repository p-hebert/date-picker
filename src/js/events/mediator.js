var Mediator = (function(){
  function Mediator() {
    this.uuid = UUIDUtils.generateUUID();
    this.uuids = [];
    this.subscriptions = {};
    this.subscribers = {};
    this.takenUUIDs = [];
  }

  Mediator.prototype._checkType = function (subscriber) {
      if(!(subscriber instanceof Colleague)) throw new TypeError("Cannot register object that is not instance of Colleague");
  };

  Mediator.prototype.register = function(subscriber){
    this._checkType(subscriber);
    var uuid;
    do {
      uuid = UUIDUtils.generateUUID();
    }while(this.takenUUIDs.indexOf(uuid) !== -1);
    this.takenUUIDs.push(uuid);
    if(subscriber.mediation === undefined) subscriber.mediation = {};
    subscriber.mediation.uuid = uuid;

    if(this.subscribers[uuid] === undefined){
      this.subscribers[uuid] = { sub: subscriber, events: [] };
    }
  };

  Mediator.prototype.subscribe = function (eventstr, subscriber) {
    this._checkType(subscriber);
    if(subscriber.mediation.uuid === undefined){
      this.register(subscriber);
    }
    var uuid = subscriber.mediation.uuid;
    var success = true;
    //Brand new event
    if(this.subscriptions[eventstr] === undefined){
      this.subscriptions[eventstr] = [uuid];
      this.subscribers[uuid].events.push(eventstr);
    //Already subscribed
    }else if(this.subscriptions[eventstr].indexOf(uuid) !== -1){
      success = false;
    //New subscription to already existing event
    }else{
      this.subscriptions[eventstr].push(uuid);
      this.subscribers[uuid].events.push(eventstr);
    }
    return success;
  };

  Mediator.prototype.unsubscribe = function (eventstr, subscriber) {
    this._checkType(subscriber);
    var success = true,
        index,
        eventindex;
    //If there is subscriptions for the event,
    //and the subscriber has a subscriber uuid
    if(this.subscriptions[eventstr] !== undefined &&
       subscriber.mediation !== undefined &&
       subscriber.mediation.uuid !== undefined){

      index = this.subscriptions[eventstr].indexOf(subscriber.mediation.uuid);
      if(index !== -1){
        //remove event subscription
        this.subscriptions[eventstr].splice(index, 1);
        eventindex = this.subscribers[subscriber[this.uuid]].events.indexOf(eventstr);
        this.subscribers[subscriber[this.uuid]].events.splice(eventindex, 1);
      }
      // If subscriber doesn't listen to anything anymore, remove it.
      // if(this.subscribers[subscriber[this.uuid]].events.length === 0){
      //   delete this.subscribers[subscriber[this.uuid]];
      //   this.takenUUIDs.splice(this.takenUUIDs.indexOf(subscriber[this.uuid]), 1);
      //   delete subscriber[this.uuid];
      // }
    }else{
      success = false;
    }
    return success;
  };

  Mediator.prototype.notify = function (source, e) {
    //console.log("Mediator.prototype.notify - forwarding\n" + e.name + "\nto:");
    this._checkType(source);
    var success = true;
    if(source.mediation !== undefined && source.mediation.uuid !== undefined &&
       this.subscriptions[e.name] !== undefined){
      for(var i = 0 ; i < this.subscriptions[e.name].length; i++){
        //console.log(this.subscribers[this.subscriptions[e.name][i]].sub.mediation.component + ':' + this.subscribers[this.subscriptions[e.name][i]].sub.mediation.uuid + " {"+this.subscribers[this.subscriptions[e.name][i]].sub.scale+"}");
        this.subscribers[this.subscriptions[e.name][i]].sub.notify(e);
      }
    }else{
      success = false;
    }
    return success;
  };

  return Mediator;
})();
