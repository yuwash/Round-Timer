$(document).ready(function(){
  //timer variables
  var totalRounds = 0,
      roundMinutes = 0,
      roundSeconds = 0,
      restSeconds = 0,
      restMinutes = 0,
      resting = false,
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
      gong = document.getElementById("gong"),
//start 10 second prep timer
      p = 10;

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
  var DisplayedTime = function( timeDisplays ) {
    this.timeDisplays = timeDisplays;
    this.__minutes = timeDisplays[0].getSeconds();
    this.__seconds = timeDisplays[0].getMinutes();
  }

  DisplayedTime.prototype.setMinutes = function( minutes ) {
    // test necessary to prevent infinite reciprocal calls
    if(this.__minutes != minutes) {
      this.__minutes = minutes;
      for (var i in this.timeDisplays) {
        this.timeDisplays[i].setMinutes(minutes);
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
    this.onChangeFunction = onChangeFunction;
    this.pull();
  }

  DisplayedCounter.prototype.pull = function() {
    this.__counter = parseInt(this.displayElement.text());
    this.onChangeFunction(this.__counter);
  }

  DisplayedCounter.prototype.push = function() {
    this.displayElement.text(this.__counter);
  }

  DisplayedCounter.prototype.get = function() {
    return this.__counter;
  }

  DisplayedCounter.prototype.set = function( counter ) {
    if(this.__counter != counter) {
      this.__counter = counter;
      this.push();
      this.onChangeFunction(this.__counter);
    }
  }

  DisplayedCounter.prototype.inc = function() {
    this.__counter++;
    this.push();
    this.onChangeFunction(this.__counter);
  }

  DisplayedCounter.prototype.dec = function() {
    this.__counter--;
    this.push();
    this.onChangeFunction(this.__counter);
  }

  var roundTime = DisplayedTime.getTimeWithNewDisplay($("#round-time #r-minutes"), $("#round-time #r-seconds"));
  var restTime = DisplayedTime.getTimeWithNewDisplay($("#rest #rt-minutes"), $("#rest #rt-seconds"));
  var timerTime = DisplayedTime.getTimeWithNewDisplay($("#tminutes"), $("#tseconds"))

  roundTime.timeDisplays.push(timerTime.timeDisplays[0]);

  var totalRoundsCounter = new DisplayedCounter($("#total-rounds"), function(n){totalRounds = n;});
  var roundsCounter = new DisplayedCounter($("#rounds"), function(n){});
  var prepareTimerCounter = new DisplayedCounter($("#ptimer"), function(n){});

  $("#rounds .plus").click(function(){
    totalRoundsCounter.pull();
    totalRoundsCounter.inc();
  });

  $("#rounds .minus").click(function(){
    totalRoundsCounter.pull();
    if(totalRoundsCounter.get() > 0) {
      totalRoundsCounter.dec();
    }
  });

// Round time controls
  $("#round-time .plus").click(function(){
    roundTime.incSeconds();
    roundSeconds = roundTime.getSeconds();
  });

 $("#round-time .minus").click(function(){
    roundTime.decSeconds();
    roundSeconds = roundTime.getSeconds();
  });


 $("#round-time .plus-minutes").click(function(){
    roundTime.incMinutes();
    roundMinutes = roundTime.getMinutes();
  });

  $("#round-time .minus-minutes").click(function(){
    roundTime.decMinutes();
    roundMinutes = roundTime.getMinutes();
  });

//rest controls
 $("#rest .plus").click(function(){
   restTime.incSeconds();
   restSeconds = restTime.getSeconds();
});

  $("#rest .minus").click(function(){
    restTime.decSeconds();
    restSeconds = restTime.getSeconds();
  });

 $("#rest .plus-minutes").click(function(){
   restTime.incMinutes();
   restMinutes = restTime.getMinutes();
 });

 $("#rest .minus-minutes").click(function(){
   restTime.decMinutes();
   restMinutes = restTime.getMinutes();
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
  if(totalRounds == 0){
    alert("You must set the number of rounds");
  }else{
    $("#start").hide();
    $("#prepare").css("margin-left","0");
    prepareTimerCounter.set(p);
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
    roundSeconds = timerTime.getSeconds();
    roundMinutes = timerTime.getMinutes();
    if((roundSeconds == 10) && (roundMinutes == 0)){
      ten.play();
    }
  }
}

var initRest = function () {
  gong.play();
  //totalRounds -= 1;
  roundsCounter.dec();
  resting = true;
  timerTime.setMinutes(restMinutes);
  timerTime.setSeconds(restSeconds);
  $("#round-counter").css("background-color","red");
}

var endTimer = function() {
  timerReset();
  alert("Session Over!");
  //reset totalRounds for low res windows
  /*
  if(window.innerWidth <= 600){
    totalRoundsCounter.set($("#mobile-round-count").val());
  }else{
    totalRoundsCounter.pull();
  }
  */
  $("#start").show();
}

//rest time
var rest = function(){
  if((restSeconds > 0) || ((restSeconds == 0) && (restMinutes >0))){
    timerTime.decSeconds();
    restMinutes = timerTime.getMinutes();
    restSeconds = timerTime.getSeconds();
  }else{
    resting = false;
    bell.play();
  }
 }
//resest all variables
var timerReset = function(){
  $("#round-counter").css("background-color","white");
    // reset variables from mobile inputs
    if(window.innerWidth <= 600 ){
      roundMinutes  = $(".mobile-round-minutes").val();
      roundSeconds  = $(".mobile-round-seconds").val();
      restMinutes = $(".mobile-rest-minutes").val();
      restSeconds  = $(".mobile-rest-seconds").val();
      totalRounds = $(".mobile-round-count").val();
      roundTime.setMinutes(roundMinutes);
      roundTime.setSeconds(roundSeconds);
      restTime.setMinutes(restMinutes);
      restTime.setSeconds(restSeconds);
      totalRoundsCounter.set(totalRounds);
    }else{
      //reset variables from desktop inputs
      roundSeconds = roundTime.getSeconds();
      roundMinutes = roundTime.getMinutes();
      restSeconds = restTime.getSeconds();
      restMinutes = restTime.getMinutes();
    }
    timerTime.setMinutes(roundMinutes);
    timerTime.setSeconds(roundSeconds);
    roundsCounter.set(totalRounds);
    prepareTimerCounter.set(p);
}

var counter = function(){
  var countdown = setInterval(function(){
    switch(true){
      case ((roundsCounter.get() > 0) && (roundSeconds > 0) && (!resting)):
      case ((roundSeconds == 0) && (roundMinutes >0)) :
        decreaseSeconds();
      break;

      case ((roundMinutes == 0) && (roundSeconds == 0) && (!resting) && (roundsCounter.get() != 1)):
        initRest();
      break;

      case ((roundsCounter.get() >= 1) && (resting)):
        rest();
      break;

      default:
        clearInterval(countdown);
        endTimer();
    }
  }, 1000);
}

/*
#################################################################
Counter built using else-if, removed in favor of switch statement
#################################################################
var counter = function(){
  resting = 0;
    var countdown = setInterval(function(){
      if((roundsCounter.get() > 0) && (roundSeconds > 0) && (resting == 0)){
        if((roundSeconds == 10) && (roundMinutes == 0)){
          ten.play();
        }
        roundSeconds -= 1;
        $("#tseconds").bidigitNumber(restSeconds);
      }else if((roundSeconds == 0) && (roundMinutes >0)){
        roundMinutes -= 1;
        roundSeconds = 59;
        timerTime.setMinutes(roundMinutes);
        timerTime.setSeconds(roundSeconds);
      }else if((roundMinutes == 0) && (roundSeconds == 0) && (resting == 0) && (roundsCounter.get() != 1)){
        gong.play();
        roundsCounter.dec();
        resting += 1;
        timerTime.setMinutes(restMinutes);
        timerTime.setSeconds(restSeconds);
        $("#round-counter").css("background-color","red");
      }else if ((roundsCounter.get() >= 1) && (resting == 1)){
        rest();
       //end of main if statement
      }else{
        timerReset();
        clearInterval(countdown);
        alert("Session Over!");
        //reset totalRounds for low res windows
          if(window.innerWidth <= 600){
            roundsCounter.set($("#mobile-round-count").val());
          }else{
            roundsCounter.get() = parseInt($("#total-rounds").text());
          }
        $("#start").show();
      }
    },1000);
}*/

//end
});
