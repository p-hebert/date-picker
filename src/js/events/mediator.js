var Mediator = (function(){
  function Mediator() {
    this.uuid = UUIDUtils.generateUUID();
    this.uuids = [];
    this.subscriptions = {};
    this.subscribers = {};
    this.takenUUIDs = [];
  }

  Mediator.prototype.register = function (eventstr, subscriber) {
    var uuid;
    if(subscriber[this.uuid] !== undefined){
      uuid = subscriber[this.uuid];
    }else{
      do {
        uuid = UUIDUtils.generateUUID();
      }while(this.takenUUIDs.indexOf(uuid) !== -1);
      this.takenUUIDs.push(uuid);
      subscriber[this.uuid] = uuid;
    }

    if(this.subscribers[uuid] === undefined){
      this.subscribers[uuid] = { sub: subscriber, events: [] };
    }

    var success = true;
    if(this.subscriptions[eventstr] === undefined){
      this.subscriptions[eventstr] = [uuid];
      this.subscribers[uuid].events.push(eventstr);
    }else if(this.subscriptions[eventstr].indexOf(uuid) !== -1){
      success = false;
    }else{
      this.subscriptions[eventstr].uuids.push(uuid);
      this.subscribers[uuid].events.push(eventstr);
    }
    return success;
  };

  Mediator.prototype.unregister = function (eventstr, subscriber) {
    var success = true,
        index,
        eventindex;
    if(this.subscriptions[eventstr] !== undefined && subscriber[this.uuid] !== undefined){

      index = this.subscriptions[eventstr].indexOf(subscsriber[this.uuid]);
      if(index !== -1){
        //remove event subscription
        this.subscriptions[eventstr].splice(index, 1);
        eventindex = this.subscribers[subscriber[this.uuid]].events.indexOf(eventstr);
        this.subscribers[subscriber[this.uuid]].events.splice(eventindex, 1);

        //If subscriber doesn't listen to anything anymore, remove it.
        if(this.subscribers[subscriber[this.uuid]].events.length === 0){
          delete this.subscribers[subscriber[this.uuid]];
          this.takenUUIDs.splice(this.takenUUIDs.indexOf(subscriber[this.uuid]), 1);
          delete subscriber[this.uuid];
        }
      }
    }else{
      success = false;
    }
    return success;
  };

  Mediator.prototype.notify = function (eventstr, source, data) {
    var success = true;
    if(this.subscriptions[eventstr] !== undefined){
      var e = {name: eventstr, source: source, data: data};
      for(var i = 0 ; i < this.subscriptions[eventstr].length; i++){
        this.subscribers[this.subscriptions[eventstr][i]].sub.notify(e);
      }
    }else{
      success = false;
    }
    return success;
  };

  return Mediator;
})();
