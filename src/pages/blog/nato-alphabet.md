---
layout: "../../layouts/Blog.astro"
title: "Learning the NATO phonetic alphabet with the Web Speech API"
pubDate: "2024-12-29"
description: "and they told me \"video games can't teach you anything\""
tags: ["projects", "games"]
author: "Andrew"
bestof: false
---

## Motivation

As I write this, it's winter break! I'm back home and, along with sleeping in and grinding leetcode, I've been catching up on my video game backlog. One of my favorites right now is a virtual reality flight simulator called [VTOL VR](https://store.steampowered.com/app/667970/VTOL_VR/) (named after the type of aircraft that can perform [the takeoff and landing maneuver](https://en.wikipedia.org/wiki/VTOL)).

<div
  style="
    max-width: 550px;
    margin: 0 auto;
    text-align: center;
  "
>
  <img
    src="/images/nato/VTOLVR_JixB7h0JTJ.jpg"
    alt="An in-air T55 from VTOL VR."
    style="max-width: 80%; height: auto;"
  />
</div>

<p style="margin-top: 10px;">
    <i style="display: flex; justify-content: center; font-size: 0.95em;">An in-air T55 from VTOL VR.</i>
</p>

There are multiplayer lobbies in the game where you're able to talk to other pilots/air traffic controllers on the radio frequency. And while the level of realism is nowhere near what other networks such as [VATSIM](https://vatsim.net/) attempt to maintain, it's not unheard of for radio communications to contain some of the specialized jargon used in the aviation industry. One hallmark of this lingo is the use of the [NATO phonetic alphabet](https://en.wikipedia.org/wiki/NATO_phonetic_alphabet), which is a mapping of every letter and number in the Roman alphabet. It's used to differentiate between letters that could be confused over a low-quality signal, such as radio or telephone. Imagine trying to tell the difference between common letters like `B` and `D`, or `M` and `N` on a radio channel filled with static.

<div
  style="
    max-width: 550px;
    margin: 0 auto;
    text-align: center;
  "
>
  <img
    src="/images/nato/alphabet.png"
    alt="NATO phonetic alphabet."
    style="max-width: 80%; height: auto;"
  />
</div>

<p style="margin-top: 10px;">
    <i style="display: flex; justify-content: center; font-size: 0.95em;">
        NATO phonetic alphabet.&nbsp;
        <a href="https://en.wikipedia.org/wiki/NATO_phonetic_alphabet">(Source)</a>
    </i>
</p>


For example, if you're talking to an air traffic controller, mistakenly interpreting an instruction to `hold short runway 23 at *P*` as `hold short runway 23 at *B*` could potentially put multiple aircraft in danger. Because of this, the NATO phonetic system requires that any spelling of letters is expanded into the corresponding word in the alphabet. Each letter is individually pronounced -- an aircraft with the callsign `N123AB` would be pronounced as `NOVEMBER ONE TWO THREE ALPHA BRAVO`.

The issue is... I don't play aviation-related games with comms frequently enough to have proficiency with the NATO alphabet. I'm lucky that VTOL includes the phoneticization of the callsign of your plane, because if they didn't, I would have _no clue_ on how to properly describe my aircraft to people on frequency.

Just for fun, though[^1], I'd still like to be proficient at interpreting the letters.

## The Website

...so, I made a website. I used Astro as the framework, just because it's what I'm most comfortable with when rapidly prototyping. The [primary page](https://github.com/AndrewDTR/learn-nato/blob/master/src/pages/index.astro) contains nothing more than a few labels and a button, but that's all I needed!

The site will give you a four letter character combination -- say, `JUFH`, for example. It'll then activate your microphone and listen to hear if you say the correct phoneticization (in this case, it would mark you correct if you said `JULIET UNIFORM FOXTROT HOTEL`). If you blank on what a specific letter stands for, there's a hint button that you can press to see what to pronounce.[^2] When you get it correct, there's a nice burst of confetti, and the site will prompt you to try another example.

<div
  style="
    max-width: 550px;
    margin: 0 auto;
    text-align: center;
    margin-bottom: 20px;
  "
>
  <img
    src="/images/nato/challenge-ex.png"
    alt="A challenge example from the NATO phonetic alphabet website."
    style="max-width: 100%; height: auto;"
  />
</div>

The hardest part of this was the audio detection -- but that wasn't too bad! Nearly every browser (except for Firefox...[^3]) supports the Web Speech API, which allows you to easily transcribe and synthesize text. There's no backend (at least, none that I had to deal with, as `SpeechRecognition` is a native browser API). All I have to do is check if the user's browser supports it, and, if so, initialize a few basic parameters.

```js
const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const speech = new SpeechRecognition();
      speech.lang = "en-US";
      speech.interimResults = false;
      speech.continuous = true;
      ...
```

The browser calls a `speech.onresult` event when the user is finished speaking, and... that's it! All the validation is simply comparing that input with the expected result (which I generate from a dictionary of the phoneticizations).

That's it! [Here's the link to the site, if you'd like to try it out](https://nato.amoses.dev/). It's [entirely open source](https://github.com/AndrewDTR/learn-nato), so feel free to peek around if you're curious about any of the implementation details.

[^1]: _And_ because I'd like to be able to listen to plane spotting/ATC breakdown videos without having to pause the video and interpret the letters being said...

[^2]: Notably, pressing the hint button doesn't automatically skip you -- it still requires that you say the correct answer. This was inspired by the design pattern of Duolingo, whose team definitely has more UX experience with language learning than I do!

[^3]: Firefox has speech _synthesis_, which is the portion of the Web Speech API that allows for text to speech. However, because the speech recognition aspect of the API relies on offloading the data to remote servers, Mozilla hasn't implemented support for it. The site can recognize this and displays a generic "...speech recognition is not supported in this browser" message. Yes, there are various speech recognition models that you can load into the browser's cache with WASM, but that feels like an unproportionate amount of effort for such a small user base who won't be receiving the intended experience.
