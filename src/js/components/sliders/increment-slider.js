var IncrementSlider = (function(){
  function IncrementSlider(options, component){
    //super()
    component = component === undefined? IncrementSlider.prototype.component : component;
    Colleague.call(this, options.mediator, component);
    this.mediation.events.emit.bupdate = this._constructEventString(Events.scope.emit, Events.desc.update.bis);
    this.min_value = options.min_value;
    this.max_value = options.max_value;
    this.value = options.value;
  }

  //Binding the prototype of the Parent object
  //Properties will be overriden on this one.
  IncrementSlider.prototype = Object.create(Colleague.prototype);

  //Binding the constructor to the prototype
  IncrementSlider.prototype.constructor = Colleague;

  //Component for Event Strings
  IncrementSlider.prototype.component = 'INCSLIDER';

  IncrementSlider.prototype.enum = {
    callbacks: {
      notify: "notify",
      emit: "emit",
      prev: "prev",
      maxchange: "maxchange",
      minchange: "minchange",
      valuechange: "valuechange",
      next: "next",
      event: "event"
    }
  };

  IncrementSlider.prototype.generateHTML = function(){
    var self = this;
    var inner =
      '<span class="increment-input-value"></span>' +
      '<nav>' +
        '<svg class="increment-input-button prev"><use xlink:href="#arrow-prev-small"></svg>' +
        '<svg class="increment-input-button next"><use xlink:href="#arrow-next-small"></svg>' +
      '</nav>';
    this.input = document.createElement('div');
    this.input.className = "increment-input";
    this.input.innerHTML = inner;
    this.setUIValue();
    this.prev = this.input.children[1].children[0];
    this.prev.addEventListener('click', function(){
      self.onPrevClick();
    });
    this.next = this.input.children[1].children[1];
    this.next.addEventListener('click', function(){
      self.onNextClick();
    });
  };

  IncrementSlider.prototype.getHTML = function () {
    return this.input;
  };

  IncrementSlider.prototype.getValue = function () {
    return this.value;
  };

  IncrementSlider.prototype.setValue = function(value){
    this.value = value;
    this.setUIValue();
    this.callCallback(IncrementSlider.prototype.enum.callbacks.valuechange);
  };

  IncrementSlider.prototype.onPrevClick = function () {
    this.callCallback(IncrementSlider.prototype.enum.callbacks.prev);
  };

  IncrementSlider.prototype.onNextClick = function () {
    this.callCallback(IncrementSlider.prototype.enum.callbacks.next);
  };

  IncrementSlider.prototype.setUIValue = function(){
    this.input.children[0].innerHTML = this.value;
  };

  IncrementSlider.prototype.updateUIControls = function(){
    //Hiding previous button if at the min value
    if(this.testMin()){
      this.prev.setAttribute("class", "increment-input-button prev disabled");
      this.prev.isDisabled = true;
      //Hiding next button if at the max value
    }else if(this.testMax()){
      this.next.setAttribute("class", "increment-input-button next disabled");
      this.next.isDisabled = true;
    //Else making sure button is visible
    }else{
      if(this.min_value !== undefined){
        this.prev.setAttribute("class", "increment-input-button prev");
        this.prev.isDisabled = false;
      }
      if(this.max_value !== undefined){
        this.next.setAttribute("class", "increment-input-button next");
        this.next.isDisabled = false;
      }
    }
  };

  IncrementSlider.prototype.testMin = function(){
    return this.min_value !== undefined && this.min_value == this.getValue();
  };

  IncrementSlider.prototype.testMax = function(){
    return this.max_value !== undefined && this.max_value == this.getValue();
  };

  IncrementSlider.prototype.subscribe = function (parent) {
    if(parent !== undefined){
      this.mediator.subscribe(this.mediation.events.emit.gupdate, parent);
      this.mediator.subscribe(this.mediation.events.emit.bupdate, parent);
    }
  };

  return IncrementSlider;

})();
