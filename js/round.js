$(document).ready(function(){
  //timer variables
  var totalRounds = 0,
      roundMinutes = 0,
      roundSeconds = 0,
      restSeconds = 0,
      restMinutes = 0,
      restTime = false,
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

  var roundTimeDisplay = new TimeDisplay($("#round-time #r-minutes"), $("#round-time #r-seconds"));
  var restTimeDisplay = new TimeDisplay($("#rest #rt-minutes"), $("#rest #rt-seconds"));
  var timerTimeDisplay = new TimeDisplay($("#tminutes"), $("#tseconds"));

  $("#rounds .plus").click(function(){
    var rounds = parseInt($("#total-rounds").text());
    rounds = rounds + 1;
    $("#total-rounds").text(rounds);
    totalRounds = rounds;
   });

  $("#rounds .minus").click(function(){
    var rounds = parseInt($("#total-rounds").text());
      if(rounds > 0){
        rounds = rounds - 1;
      }
    $("#total-rounds").text(rounds);
    totalRounds = rounds;
    });

// Round time controls
  $("#round-time .plus").click(function(){
    var seconds = roundTimeDisplay.getSeconds();
    seconds = (seconds + 1)%60;
    roundTimeDisplay.setSeconds(seconds);
    timerTimeDisplay.setSeconds(seconds);
    roundSeconds = seconds;
  });

 $("#round-time .minus").click(function(){
    var seconds = roundTimeDisplay.getSeconds();
    seconds = (seconds - 1)%60;
    if(seconds < 0 ){
      seconds += 60;
    }
    roundTimeDisplay.setSeconds(seconds);
    timerTimeDisplay.setSeconds(seconds);
    roundSeconds = seconds;
  });


 $("#round-time .plus-minutes").click(function(){
    var minutes = roundTimeDisplay.getMinutes();
    minutes = (minutes + 1)%60;
    roundTimeDisplay.setMinutes(minutes);
    timerTimeDisplay.setMinutes(minutes);
    roundMinutes = minutes;
  });

  $("#round-time .minus-minutes").click(function(){
    var minutes = roundTimeDisplay.getMinutes();
    minutes = (minutes - 1)%60;
    if(minutes < 0 ){
      minutes += 60;
    }
    roundTimeDisplay.setMinutes(minutes);
    timerTimeDisplay.setMinutes(minutes);
    roundMinutes = minutes;
  });

//rest controls
 $("#rest .plus").click(function(){
    var seconds = restTimeDisplay.getSeconds();
    seconds = (seconds + 1)%60;
    if (seconds < 60){
      restTimeDisplay.setSeconds(seconds);
      restSeconds = seconds;
   }
});

  $("#rest .minus").click(function(){
    var seconds = restTimeDisplay.getSeconds();
    seconds = (seconds - 1)%60;
    if(seconds < 0 ){
      seconds += 60;
    }
    restTimeDisplay.setSeconds(seconds);
    restSeconds = seconds;
  });

 $("#rest .plus-minutes").click(function(){
   var min = restTimeDisplay.getMinutes();
   min = (min + 1)%60;
   restTimeDisplay.setMinutes(min);
   restMinutes = min;
 });

 $("#rest .minus-minutes").click(function(){
   var min = restTimeDisplay.getMinutes();
   min = (min -1)%60;
   if(min < 0 ){
     min += 60;
   }
   restTimeDisplay.setMinutes(min);
   restMinutes = min;
 });


// mobile controls

$(".mobile-round-count").change(function(){
  totalRounds = parseInt($(this).val());
  console.log(totalRounds)
});

$(".mobile-round-minutes").change(function() {
  var min = parseInt($(this).val());
  roundMinutes = min;
  console.log(roundMinutes);
  timerTimeDisplay.setMinutes(roundMinutes);
});

$( ".mobile-round-seconds" ).change(function() {
  var seconds = parseInt($(this).val());
  roundSeconds = seconds;
  console.log(roundSeconds);
  timerTimeDisplay.setSeconds(roundSeconds);
});

$(".mobile-rest-minutes").change(function(){
  var minutes = parseInt($(this).val());
  restMinutes = minutes;
  console.log(restMinutes)
});

$(".mobile-rest-seconds").change(function(){
  var seconds = parseInt($(this).val());
  restSeconds = seconds;
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
    $("#ptimer").text(p);
    var prep = setInterval(function(){
    p -= 1;
    $("#ptimer").text(p);
    //start main timer at the end of the prep timer, hide prep timer
    if(p == 0){
      $("#prepare").css("margin-left","-9999px");
      clearInterval(prep);
      bell.play();
      counter();
    }
   //prep end
   }, 1000);
  }
});

//counter functions
var decreaseSeconds = function() {
  if(roundSeconds > 0){
    roundSeconds -= 1;
    if((roundSeconds == 10) && (roundMinutes == 0)){
      ten.play();
    }
    timerTimeDisplay.setSeconds(roundSeconds);
  }else if(roundSeconds == 0){
    decreaseMinutes();
  }
}

var decreaseMinutes = function (){
  roundMinutes -= 1;
  roundSeconds = 59;
  timerTimeDisplay.setMinutes(roundMinutes);
  timerTimeDisplay.setSeconds(roundSeconds);
}

var initRest = function () {
  gong.play();
  totalRounds -= 1;
  restTime = true;
  timerTimeDisplay.setMinutes(restMinutes);
  timerTimeDisplay.setSeconds(restSeconds);
  $("#round-counter").css("background-color","red");
}

var endTimer = function() {
  timerReset();
  alert("Session Over!");
  //reset totalRounds for low res windows
  if(window.innerWidth <= 600){
    totalRounds=$("#mobile-round-count").val();
  }else{
    totalRounds = parseInt($("#total-rounds").text());
  }
  $("#start").show();
}

//rest time
var rest = function(){
  if(restSeconds > 0){
    restSeconds -= 1;
    timerTimeDisplay.setSeconds(restSeconds);
  }else if((restSeconds == 0) && (restMinutes >0)){
    restMinutes -= 1;
    restSeconds = 59;
    timerTimeDisplay.setMinutes(restMinutes);
    timerTimeDisplay.setSeconds(restSeconds);
  }else{
    restTime = false;
    bell.play();
    timerReset();
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
    }else{
      //reset variables from desktop inputs
      roundSeconds = roundTimeDisplay.getSeconds();
      roundMinutes = roundTimeDisplay.getMinutes();
      restSeconds = restTimeDisplay.getSeconds();
      restMinutes = restTimeDisplay.getMinutes();
    }
    timerTimeDisplay.setMinutes(roundMinutes);
    timerTimeDisplay.setSeconds(roundSeconds);
    p = 10;
}

var counter = function(){
  var countdown = setInterval(function(){
    switch(true){
      case ((totalRounds > 0) && (roundSeconds > 0) && (!restTime)):
        decreaseSeconds();
      break;

      case ((roundSeconds == 0) && (roundMinutes >0)) :
        decreaseMinutes();
      break;

      case ((roundMinutes == 0) && (roundSeconds == 0) && (!restTime) && (totalRounds != 1)):
        initRest();
      break;

      case ((totalRounds >= 1) && (restTime)):
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
  restTime = 0;
    var countdown = setInterval(function(){
      if((totalRounds > 0) && (roundSeconds > 0) && (restTime == 0)){
        if((roundSeconds == 10) && (roundMinutes == 0)){
          ten.play();
        }
        roundSeconds -= 1;
        $("#tseconds").bidigitNumber(restSeconds);
      }else if((roundSeconds == 0) && (roundMinutes >0)){
        roundMinutes -= 1;
        roundSeconds = 59;
        timerTimeDisplay.setMinutes(roundMinutes);
        timerTimeDisplay.setSeconds(roundSeconds);
      }else if((roundMinutes == 0) && (roundSeconds == 0) && (restTime == 0) && (totalRounds != 1)){
        gong.play();
        totalRounds -= 1;
        restTime += 1;
        timerTimeDisplay.setMinutes(restMinutes);
        timerTimeDisplay.setSeconds(restSeconds);
        $("#round-counter").css("background-color","red");
      }else if ((totalRounds >= 1) && (restTime == 1)){
        rest();
       //end of main if statement
      }else{
        timerReset();
        clearInterval(countdown);
        alert("Session Over!");
        //reset totalRounds for low res windows
          if(window.innerWidth <= 600){
            totalRounds=$("#mobile-round-count").val();
          }else{
            totalRounds = parseInt($("#total-rounds").text());
          }
        $("#start").show();
      }
    },1000);
}*/

//end
});
