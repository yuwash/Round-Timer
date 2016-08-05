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
  }

  var resting = false,
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
  var TimeDisplay = function( minutesElement, secondsElement ) {
    this.minutesElement = minutesElement;
    this.secondsElement = secondsElement;
  }

  TimeDisplay.prototype.setMinutes = function( minutes ) {
    this.minutesElement.bidigitNumber( minutes );
  }

  TimeDisplay.prototype.setSeconds = function( seconds ) {
    this.secondsElement.bidigitNumber( seconds );
  }

  TimeDisplay.prototype.getMinutes = function() {
    return parseInt(this.minutesElement.text());
  }

  TimeDisplay.prototype.getSeconds = function() {
    return parseInt(this.secondsElement.text());
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
    if(window.innerWidth <= 600) {
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

  DisplayedTime.getTimeWithNewDisplay = function( minutesElement, secondsElement ) {
    var display = new TimeDisplay(minutesElement, secondsElement);
    var time = new DisplayedTime([display]);
    return time;
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

  var roundTime = DisplayedTime.getTimeWithNewDisplay($("#round-time #r-minutes"), $("#round-time #r-seconds"));
  var restTime = DisplayedTime.getTimeWithNewDisplay($("#rest #rt-minutes"), $("#rest #rt-seconds"));
  var timerTime = DisplayedTime.getTimeWithNewDisplay($("#tminutes"), $("#tseconds"))

  roundTime.mobileTimeDisplays.push(new TimeDisplay($("mobile-round-minutes"), $("mobile-round-seconds")));
  restTime.mobileTimeDisplays.push(new TimeDisplay($("mobile-rest-minutes"), $("mobile-rest-seconds")));
  roundTime.timeDisplays.push(timerTime.timeDisplays[0]);

  var totalRoundsCounter = new DisplayedCounter($("#total-rounds"));
  var roundsCounter = new DisplayedCounter($("#rounds"));
  var prepareTimerCounter = new DisplayedCounter($("#ptimer"));

  $("#rounds .plus").click(function(){
    totalRoundsCounter.read();
    totalRoundsCounter.inc();
  });

  $("#rounds .minus").click(function(){
    totalRoundsCounter.read();
    if(totalRoundsCounter.get() > 0) {
      totalRoundsCounter.dec();
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
  console.log(totalRounds)
});

$(".mobile-round-minutes").change(function() {
  roundMinutes = parseInt($(this).val());
  roundTime.setMinutes(roundMinutes);
  console.log(roundMinutes);
});

$( ".mobile-round-seconds" ).change(function() {
  roundSeconds = parseInt($(this).val());
  roundTime.setSeconds(roundSeconds);
  console.log(roundSeconds);
});

$(".mobile-rest-minutes").change(function(){
  restMinutes = parseInt($(this).val());
  restTime.setMinutes(restMinutes);
  console.log(restMinutes)
});

$(".mobile-rest-seconds").change(function(){
  restSeconds = parseInt($(this).val());
  restTime.setSeconds(restSeconds);
  console.log(seconds);
});


//MAIN FUNCTIONALITY
$("#stop").click(function(){
  location.reload();
});

$("#start").click(function(){
  if(totalRoundsCounter.get() == 0){
    alert("You must set the number of rounds");
  }else{
    $("#start").hide();
    $("#prepare").css("margin-left","0");
    prepareTimerCounter.set(INITIAL_STATE.p);
    var prep = setInterval(function(){
      prepareTimerCounter.dec();
    //start main timer at the end of the prep timer, hide prep timer
    if(prepareTimerCounter.get() == 0){
      $("#prepare").css("margin-left","-9999px");
      clearInterval(prep);
      bell.play();
      timerReset();
      counter();
    }
   //prep end
   }, 1000);
  }
});

//counter functions
var decreaseSeconds = function() {
  if(timerTime.getTotalSeconds() > 0) {
    timerTime.decSeconds();
    if(timerTime.getTotalSeconds() == 10){
      ten.play();
    }
  }
}

var initRest = function () {
  gong.play();
  roundsCounter.dec();
  resting = true;
  timerTime.pullFrom(restTime);
  $("#round-counter").css("background-color","red");
}

var endTimer = function() {
  timerReset();
  alert("Session Over!");
  $("#start").show();
}

//rest time
var rest = function(){
  timerTime.decSeconds();
}

var endRest = function(){
  resting = false;
  timerTime.pullFrom(roundTime);
  $("#round-counter").css("background-color","white");
  bell.play();
}

//reset all variables
var timerReset = function(){
  $("#round-counter").css("background-color","white");
  roundTime.read();
  restTime.read();
  totalRoundsCounter.read();
  timerTime.pullFrom(roundTime);
  roundsCounter.set(totalRoundsCounter.get());
}

var counter = function(){
  var countdown = setInterval(function(){
    if(timerTime.getTotalSeconds() > 0) {
      if(resting){
        rest();
      }else{
        decreaseSeconds();
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
