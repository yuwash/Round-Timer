$(document).ready(function(){
  "use strict";
  //timer variables
  var INITIAL_STATE = {
    totalRounds: 0,
    roundMinutes: 0,
    roundSeconds: 0,
    restSeconds: 0,
    restMinutes: 0,
//start 10 second prep timer
    p: 10
  };

  var resting = false,
      preping = false,
//Main functionality variables
//set interval functions to null to prevent running on window load
      prep = null,
      rest = null,
      countdown = null,
//round begin sound
      bell = document.getElementById("bell"),
//ten seconds left sound
      ten = document.getElementById("ten"),
//rest begin sound
      gong = document.getElementById("gong");

  // format seconds correctly
  (function( $ ) {
    $.fn.bidigitNumber = function( number ) {
      number %= 100;
      if(number < 10){
        this.text( "0" + number );
      }else{
        this.text( number );
      }
      return this;
    };
  }( jQuery ));

  /*
   * @param minutesElement document element that displays minutes
   * @param secondsElement document element that displays seconds
   */
  var TimeDisplay = function( minutesElement, secondsElement, useSelect ) {
    this.minutesElement = minutesElement;
    this.secondsElement = secondsElement;
    this.useSelect = useSelect == true;
  }

  TimeDisplay.prototype.setMinutes = function( minutes ) {
    if(!this.useSelect) {
      this.minutesElement.bidigitNumber( minutes );
    }
  }

  TimeDisplay.prototype.setSeconds = function( seconds ) {
    if(!this.useSelect) {
      this.secondsElement.bidigitNumber( seconds );
    }
  }

  TimeDisplay.prototype.getMinutes = function() {
    return parseInt(this.useSelect? this.minutesElement.va(): this.minutesElement.text());
  }

  TimeDisplay.prototype.getSeconds = function() {
    return parseInt(this.useSelect? this.secondsElement.val(): this.minutesElement.text());
  }

  /**
   * @param timeDisplays array of TimeDisplays that display the (same) time
   */
  var DisplayedTime = function( timeDisplays, mobileTimeDisplays ) {
    this.timeDisplays = timeDisplays;
    this.mobileTimeDisplays = mobileTimeDisplays || [];
    this.read();
  }

  DisplayedTime.prototype.read = function() {
    if(window.innerWidth <= 600 && this.mobileTimeDisplays[0]) {
      this.__minutes = this.mobileTimeDisplays[0].getMinutes();
      this.__seconds = this.mobileTimeDisplays[0].getSeconds();
    }else{
      this.__minutes = this.timeDisplays[0].getMinutes();
      this.__seconds = this.timeDisplays[0].getSeconds();
    }
  }

  DisplayedTime.prototype.setMinutes = function( minutes ) {
    // test necessary to prevent infinite reciprocal calls
    if(this.__minutes != minutes) {
      this.__minutes = minutes;
      for (var i in this.timeDisplays) {
        this.timeDisplays[i].setMinutes(minutes);
      }
      for (var i in this.mobileTimeDisplays) {
        this.mobileTimeDisplays[i].setMinutes(minutes);
      }
    }
  }

  DisplayedTime.prototype.setSeconds = function( seconds ) {
    // test necessary to prevent infinite reciprocal calls
    if(this.__seconds != seconds) {
      this.__seconds = seconds;
      for (var i in this.timeDisplays) {
        this.timeDisplays[i].setSeconds(seconds);
      }
      for (var i in this.mobileTimeDisplays) {
        this.mobileTimeDisplays[i].setSeconds(seconds);
      }
    }
  }

  DisplayedTime.prototype.pullFrom = function( other ) {
    // test necessary to prevent infinite reciprocal calls
    if(other.__seconds != this.__seconds || other.__minutes != this.__minutes) {
      this.__seconds = other.__seconds;
      this.__minutes = other.__minutes;
      for (var i in this.timeDisplays) {
        this.timeDisplays[i].setSeconds(this.__seconds);
        this.timeDisplays[i].setMinutes(this.__minutes);
      }
      for (var i in this.mobileTimeDisplays) {
        this.mobileTimeDisplays[i].setSeconds(this.__seconds);
        this.mobileTimeDisplays[i].setMinutes(this.__minutes);
      }
    }
  }

  DisplayedTime.prototype.getMinutes = function() {
    return this.__minutes;
  }

  DisplayedTime.prototype.getSeconds = function() {
    return this.__seconds;
  }

  DisplayedTime.prototype.getTotalSeconds = function() {
    return 60 * this.__minutes + this.__seconds;
  }

  DisplayedTime.prototype.addSeconds = function( secondsToAdd ) {
    var newSeconds = this.__seconds + secondsToAdd;
    if(newSeconds >= 60 || newSeconds < 0) {
      var newMinutes = Math.floor(newSeconds/60);
      this.setSeconds(newSeconds - 60 * newMinutes);
      newMinutes += this.__minutes;
      // XXX hours will be forgotten
      if(newMinutes >= 60) {
        newMinutes %= 60;
      }else if(newMinutes < 0) {
        var hours = Math.floor(newMinutes/60);
        newMinutes -= 60 * hours;
      }
      this.setMinutes(newMinutes);
    }else{
      this.setSeconds(newSeconds);
    }
  }

  DisplayedTime.prototype.incSeconds = function() {
    this.addSeconds(1);
  }

  DisplayedTime.prototype.incMinutes = function() {
    // XXX hours will be forgotten
    this.setMinutes((this.__minutes + 1) % 60);
  }

  DisplayedTime.prototype.decSeconds = function() {
    this.addSeconds(-1);
  }

  DisplayedTime.prototype.decMinutes = function() {
    // XXX hours will be forgotten
    this.setMinutes((this.__minutes + 59) % 60);
  }

  DisplayedTime.getTimeWithNewDisplay = function( minutesElement, secondsElement, mobileMinutesElement, mobileSecondsElement ) {
    var display = new TimeDisplay(minutesElement, secondsElement);
    if(mobileMinutesElement && mobileSecondsElement) {
      var mobileDisplay = new TimeDisplay(mobileMinutesElement, mobileSecondsElement);
      return new DisplayedTime([display], [mobileDisplay]);
    }
    return new DisplayedTime([display]);
  }

  /**
   * @param displayElement
   * @param onChangeFunction
   */
  var DisplayedCounter = function( displayElement, onChangeFunction ) {
    this.displayElement = displayElement;
    this.onChangeFunction = onChangeFunction || function( n ){};
    this.read(); // this.__counter initialized here
  }

  DisplayedCounter.prototype.read = function() {
    this.__counter = parseInt(this.displayElement.text());
    this.onChangeFunction(this.__counter);
  }

  DisplayedCounter.prototype.write = function() {
    this.displayElement.text(this.__counter);
  }

  DisplayedCounter.prototype.get = function() {
    return this.__counter;
  }

  DisplayedCounter.prototype.set = function( counter ) {
    if(this.__counter != counter) {
      this.__counter = counter;
      this.write();
      this.onChangeFunction(this.__counter);
    }
  }

  DisplayedCounter.prototype.inc = function() {
    this.__counter++;
    this.write();
    this.onChangeFunction(this.__counter);
  }

  DisplayedCounter.prototype.dec = function() {
    this.__counter--;
    this.write();
    this.onChangeFunction(this.__counter);
  }

  var roundTime = DisplayedTime.getTimeWithNewDisplay($("#round-time #r-minutes"), $("#round-time #r-seconds"), $("#mobile-round-minutes"), $("#mobile-round-seconds"));
  var restTime = DisplayedTime.getTimeWithNewDisplay($("#rest #rt-minutes"), $("#rest #rt-seconds"), $("#mobile-rest-minutes"), $("#mobile-rest-seconds"));
  var timerTime = DisplayedTime.getTimeWithNewDisplay($("#tminutes"), $("#tseconds"))

  roundTime.timeDisplays.push(timerTime.timeDisplays[0]);

  var totalRoundsCounter = new DisplayedCounter($("#total-rounds"));
  var roundsCounter = new DisplayedCounter($("#remaining-rounds"));
  var prepareTimerCounter = new DisplayedCounter($("#ptimer"));

  totalRoundsCounter.set(INITIAL_STATE.totalRounds);
  roundTime.setMinutes(INITIAL_STATE.roundMinutes);
  roundTime.setSeconds(INITIAL_STATE.roundSeconds);
  restTime.setMinutes(INITIAL_STATE.restMinutes);
  restTime.setSeconds(INITIAL_STATE.restSeconds);

  $("#rounds .plus").click(function(){
    totalRoundsCounter.read();
    totalRoundsCounter.inc();
  });

  $("#rounds .minus").click(function(){
    totalRoundsCounter.read();
    if(totalRoundsCounter.get() > 0) {
      totalRoundsCounter.dec();
    }else{
      alert("Rounds can not be negative!");
    }
  });

// Round time controls
  $("#round-time .plus").click(function(){
    roundTime.incSeconds();
  });

 $("#round-time .minus").click(function(){
    roundTime.decSeconds();
  });


 $("#round-time .plus-minutes").click(function(){
    roundTime.incMinutes();
  });

  $("#round-time .minus-minutes").click(function(){
    roundTime.decMinutes();
  });

//rest controls
 $("#rest .plus").click(function(){
   restTime.incSeconds();
});

  $("#rest .minus").click(function(){
    restTime.decSeconds();
  });

 $("#rest .plus-minutes").click(function(){
   restTime.incMinutes();
 });

 $("#rest .minus-minutes").click(function(){
   restTime.decMinutes();
 });


// mobile controls

$(".mobile-round-count").change(function(){
  totalRoundsCounter.set(parseInt($(this).val()));
  console.log(totalRoundsCounter.get())
});

$(".mobile-round-minutes").change(function() {
  roundTime.setMinutes(parseInt($(this).val()));
  console.log(roundTime.getMinutes());
});

$( ".mobile-round-seconds" ).change(function() {
  roundTime.setSeconds(parseInt($(this).val()));
  console.log(roundTime.getSeconds());
});

$(".mobile-rest-minutes").change(function(){
  restTime.setMinutes(parseInt($(this).val()));
  console.log(restTime.getMinutes());
});

$(".mobile-rest-seconds").change(function(){
  restTime.setSeconds(parseInt($(this).val()));
  console.log(restTime.getSeconds());
});


//MAIN FUNCTIONALITY
$("#stop").click(function(){
  location.reload();
});

$("#start").click(function(){
  counter();
});

//counter functions

//prepare time
var initPrep = function () {
  $("#total-rounds").css("display","none");
  $("#remaining-rounds").css("display","inline");
  $("#start").attr("disabled","disabled");
  $("#ptimer").css("display","inline");
  $("#time").css("display","none");
  $("#round-counter").css("background-color","yellow");
  roundsCounter.set(totalRoundsCounter.get());
  prepareTimerCounter.set(INITIAL_STATE.p);
  preping = true;
}

//start main timer at the end of the prep timer, hide prep timer
var endPrep = function () {
  $("#ptimer").css("display","none");
  $("#time").css("display","inline");
  bell.play();
  timerReset();
}

//rest time
var initRest = function () {
  gong.play();
  roundsCounter.dec();
  resting = true;
  $("#round-counter").css("background-color","red");
}

var endRest = function(){
  timerReset();
  bell.play();
}

//reset all variables
var timerReset = function(){
  $("#round-counter").removeAttr("style");
  resting = false;
  preping = false;
  timerTime.pullFrom(roundTime);
}

var endTimer = function() {
  timerReset();
  roundsCounter.set(totalRoundsCounter.get());
  alert("Session Over!");
  $("#start").removeAttr("disabled");
  $("#total-rounds").css("display","inline");
  $("#remaining-rounds").css("display","none");
}

var counter = function(){
  if(totalRoundsCounter.get() == 0){
    alert("You must set the number of rounds");
    return;
  }
  timerReset();
  initPrep();
  var countdown = setInterval(function(){
    if(preping){
      prepareTimerCounter.dec();
      if(prepareTimerCounter.get() == 0) {
        endPrep();
      }
    }else if(timerTime.getTotalSeconds() > 0) {
      timerTime.decSeconds();
      if(!resting && timerTime.getTotalSeconds() == 10){
        ten.play();
      }
    }else if(roundsCounter.get() <= 0){
      clearInterval(countdown);
      endTimer();
    }else if(resting){
      endRest();
    }else{
      initRest();
    }

  }, 1000);
}

//end
});
