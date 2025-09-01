---
layout: "../../layouts/Blog.astro"
title: "Revamping the UPL's people counter"
pubDate: "2024-10-14"
description: "who knew figuring out the lab's occupancy would be so much work?!"
tags: ["projects", "upl", "uw"]
author: "Andrew"
discussion: "Hacker News"
discussion_link: "https://news.ycombinator.com/item?id=41907360"
bestof: true
---

## A History of UPL's Cameras

For almost as long as [the Undergraduate Projects Lab](https://www.upl.cs.wisc.edu) at the University of Wisconsin has existed, there's been a camera of some sort peering at the room. There's evidence of a system existing even as far back as the 1990s, with a [prehistoric revision of the site](https://web.archive.org/web/19981202092257/http://www.upl.cs.wisc.edu/cgi-bin/uplcam.html) mentioning that an old iteration was:

> ...a $15 video camera attached to the wall with duct tape, connected to a VCR, connected to a video spigot in a Mac IIcx, running Timed Video Grabber (TVG), and FTPd. Dax, an HP workstation ran a script that would try to FTP the latest image every 60 seconds. Because the clocks would drift, occasionally, the file accesses would collide, and the whole scheme would break.

Just _reading_ that makes me stare at the camera that now sits perched on top of the arcade cabinet with wonder. What used to be several thousand dollars of equipment is now achievable (with immeasurably better quality) with a $50 webcam plugged into a Raspberry Pi.

<div style="display: flex; justify-content: center; gap: 10px; max-width: 100%; flex-wrap: wrap; margin-bottom">
    <img src="/images/upl-pc/old_upl.png" alt="A grainy image featuring an interior view of the UPL, a triangular-shaped undergraduate lab at UW-Madison." style="max-height: 250px; width: auto; max-width: 100%;" />
    <img src="/images/upl-pc/new_upl.jpeg" alt="An image featuring the interior of the UPL, a lab at UW-Madison. Students sit at laptops." style="max-height: 250px; width: auto; max-width: 100%;" />
</div>

<i style="display: flex; justify-content: center; margin-top: 10px; font-size: 0.95em;">Taken ~25 years apart.</i>

I could--and probably will--write an entire other blog post about the intricate history of the UPL, mentioning how [older versions of the website](https://web.archive.org/web/20001003051528/http://www.upl.cs.wisc.edu/uplcam/spincam.html) allowed for users to control the tilt and pan of the camera using four stepper motors attached to the camera.

However, the focus of this article is about the two _latest_ iterations of cameras in the UPL.

## &#8220;Is the UPL open right now?&#8221;

I'm sure that any UPL member can testify the horror of arriving to the lab to see a closed door. If you live anywhere off campus, it's heartbreaking to see your arduous trek to the CS building result in failure.

There's no doubt that as far back as IRC, members of the UPL messaged each other asking if the lab was open. With the advent of mobile phones, it's gotten easier to bother your friends--who may not even be in the room!

Well, myself, in collaboration with other UPL members, decided to fix this issue in, perhaps, the most CS-student-esque way possible: an automated system to identify the occupancy of the lab.

## People counting

The first iteration of the people counting system (as built by [Michael Berkey](https://github.com/mdberkey)) utilized a Logitech C920 camera mounted on a vantage point that had a clear view of the room. A Discord bot was set on a 15 minute loop (using discord.py.ext's `@tasks.loop(minutes=15)`) to call a YOLOv7 model set to class 0 (detecting people). The bot called the webcam to take an image, then ran it through the model for inference. It returned the number of people in the room (and annotated the image with bounding boxes of where it believed the people to be, for debug purposes).

<div style="display: flex; justify-content: center; gap: 10px; max-width: 100%; flex-wrap: wrap; margin-bottom">
    <img src="/images/upl-pc/camera-over.png" alt="The front side of a C920 webcam." style="max-height: 200px; width: auto; max-width: 100%;" />
    <img src="/images/upl-pc/camera-peek.png" alt="The back side of a C920 webcam." style="max-height: 200px; width: auto; max-width: 100%;" />
</div>

<i style="display: flex; justify-content: center; margin-top: 10px; font-size: 0.95em;">...don't mind the tape.</i>

It then set the name of a channel to the results (either `1-person-in-upl` or `X-people-in-upl`), which others could check.

<div style="display: flex; justify-content: center; gap: 10px; max-width: 100%; flex-wrap: wrap; margin-bottom">
    <img src="/images/upl-pc/8-people-in-upl.png" alt="A channel in the UPL Discord reads '8 people in UPL'." />
</div>

<i style="display: flex; justify-content: center; margin-top: 10px; font-size: 0.95em;">An example of what the Discord looked like on a day with a semi-busy UPL.</i>

## Switching to door sensing

This worked perfectly for a while -- people would check the Discord channel name and see the estimated count of the number of people in the room. If it said "zero people", they could infer that the UPL wasn't open.

However, this solution started presenting issues. For one, having people in the room didn't necessarily indicate that the UPL was open. There could be a meeting, or a separate gathering where the doors were closed and people weren't allowed inside. This was confusing to people who might have seen "8 people inside the UPL", only to arrive at the building to see coords having a meeting.

There was also the issue of the model sometimes interpreting the chair in the corner as a person[^1]:

<div style="display: flex; justify-content: center; gap: 10px; max-width: 100%; flex-wrap: wrap; margin-bottom">
    <img src="/images/upl-pc/upl_empty.png" alt="An image of the empty lab. An annotation on a brown armchair reads 'Person 0', despite no human on the chair." style="max-height: 250px; width: auto; max-width: 100%;" />
</div>

<i style="display: flex; justify-content: center; margin-top: 10px; font-size: 0.95em;">Either the model is too sensitive, or the UPL has a friendly ghost!</i>

It was around this time that I stumbled upon the homepage of [MITERS](https://miters.mit.edu/), a makerspace at MIT. On their website, they broadcast whether the door to the space is open using a reed switch attached to a Raspberry Pi. Reed switches are small, physical components that are able to detect a magnetic field. If you put one on a doorframe, and then attach a tiny magnet to the door itself, you have an effective way of detecting whether a door is open or closed! I was able to find [a writeup](https://andrewbirkel.com/projects/MITERS_Door.html) by a former member of the space on their implementation, but I can't guarantee that it's accurate to how it's set up there currently.

<div class="callout note">
  <div class="callout-header">
    <span class="callout-icon">ℹ️</span>
    <span>Note - Added 11/25/2024</span>
  </div>
  <p>
    In response to this article's release, I've received a <i>lot</i> of
    questions asking me why I made the choice to track the status of the doors,
    rather than other attributes of the room. Many of these questions came from
    <a href="https://news.ycombinator.com/item?id=41907360" target="_blank"
      >my post on Hacker News</a
    >, as well as the article posted on
    <a
      href="https://hackaday.com/2024/10/24/keeping-tabs-on-an-undergraduate-projects-labs-door-status/"
      target="_blank"
      >Hackaday</a
    >
    -- where one particularly amusing comment accused me of "...not looking at
    [the project] from a systems point of view." Here's my response to some of
    those questions, in no particular order:
  </p>
  <p style="margin-bottom: 3px">Why not...</p>
  <ul style="margin-top: 0; margin-bottom: 3px">
    <li>...point cameras at the doors?</li>
    <ul>
      <li>
        That could work too! However, it would just be far more complex than
        simply attaching the two Zigbee sensors on the doors -- I would have to
        train a model to recognize the difference between viewing the interior
        side of the UPL versus the CS walkway.
      </li>
    </ul>
  </ul>
  <ul style="margin-top: 0; margin-bottom: 3px">
    <li>...point the camera at the lights of the room?</li>
    <ul>
      <li>
        One of the main things that people seemed to be confused about was the
        difference between tracking the <i>state</i> of the room versus its
        <i>occupancy</i>. The key distinction is that people being in the room
        doesn't necessarily indicate that it's open to the public. There could
        be coordinators having a meeting (or a maintenance person in there
        cleaning, and so on). Yes, it would be possible to have other ways of
        knowing whether there are people <i>in the room</i> (like the other
        suggestions mentioned here), but none indicate its status as well as the
        doors (other than people just writing "the room is closed to the public"
        on Discord).
      </li>
    </ul>
  </ul>
  <ul style="margin-top: 0; margin-bottom: 3px">
    <li>...use a technological solution to detect devices in the lab?</li>
    <ul>
      <li>
        I saw a few suggestions about this -- namely,
        <a href="https://news.ycombinator.com/item?id=41908772" target="_blank"
          >this one</a
        >
        by zdw mentioning the
        <span style="font-family: monospace">finger</span> command, as well as
        <a href="https://news.ycombinator.com/item?id=41912287" target="_blank"
          >this comment</a
        >
        by zimpenfish about using
        <span style="font-family: monospace">rlogin</span> and
        <span style="font-family: monospace">who</span> to determine who's
        logged into the network. Well -- the UPL doesn't have desktop computers
        available for students to come in and use anymore. Most students just
        bring their laptop, as computers aren't necessarily hard to come by
        anymore...! We don't have the infrastructure (at least, right now) to
        allow students to ssh into our servers, and even if we did, there would
        be no way of telling if they were doing it on-premises. As for using
        WiFi/DHCP leases to detect devices (as recommended by q3k in
        <a href="https://news.ycombinator.com/item?id=41913831" target="_blank"
          >this comment</a
        >): UPLians use UWNet or eduroam, not the UPL's own WiFi network.
        There's also some privacy-related concerns about
        snooping/logging/aggregating users, even if anonymized, that highly
        dissuades us from implementing anything like that.
      </li>
    </ul>
  </ul>
  <ul style="margin-top: 0; margin-bottom: 3px">
    <li>...just use an online reservation/booking system?</li>
    <ul>
      <li>
        <a href="https://www.upl.cs.wisc.edu" target="_blank">The UPL</a> isn't
        a conference room. While there <i>is</i> a list of the coordinators'
        individual hours, the actual occupancy of the room doesn't necessarily
        follow that schedule. Sometimes coords miss their hours, and other times
        <a href="/images/upl-pc/five_am.jpg"
          >the room remains open until 5am.</a
        >
        All that to say: it is <b>not</b> possible to simply do a schedule
        lookup to determine the status of the room, and having preset times for
        determining occupancy would be inaccurate fairly often.
      </li>
    </ul>
  </ul>
  <ul style="margin-top: 0; margin-bottom: 3px">
    <li>
      ...use
      <a href="https://arxiv.org/pdf/2301.00250" target="_blank"
        >WiFi signals</a
      >
      to get an accurate number of the people in the room?
    </li>
    <ul>
      <li>
        Uh... wow. That's insanely cool. But it still doesn't expressly convey
        the <i>intent</i> of the room's use. It would still be neat to have a
        count for the number of people as <i>well as</i> the status of the room,
        so I'm definitely stashing this away in my head.
      </li>
    </ul>
  </ul>
  <p style="margin-bottom: 4px">
    Hopefully that can answer some of the most common questions I've gotten
    about the project. Thanks for reading!
  </p>
</div>

I considered using similar components for a door status checker for the UPL -- it wouldn't have been too much effort to buy WiFi enabled ESP32 modules and off-the-shelf door-mountable reed switches. Then, I would have the chips simply send a POST request with their status every time the door was opened or closed.

I decided against this approach for a few reasons:

- The UPL doesn't really have the equipment to maintain such a system. I don't know how to solder, and mounting breadboards to the walls doesn't seem like the most future-proof or aesthetically pleasing solution.

- If the system were to spontaneously break after I left, it would be difficult to find somebody to fix it. The UPL is mainly a software oriented lab!

- The WiFi ran by the university (UWNet) requires you to log in with a [captive portal](https://en.wikipedia.org/wiki/Captive_portal) to register your device to connect to the network. Without intervention, it will occasionally require you to sign back in to renew your ability to connect[^2]. While there _are_ some ways to emulate the specific requests a typical browser would use to authenticate with your NetID, it would be a ton of recurring effort (and the login it used would have to be changed as people graduated)!

So, I decided that the sensors themselves would have to act autonomously and simply relay their state to a device elsewhere in the room. Luckily, the Raspberry Pi that ran the code for the people counter was easily repurposed. I installed [Home Assistant](https://www.home-assistant.io/), an open source platform for interfacing with various network connected devices.

There are plenty of devices that track the status of doors, made by companies like Ring and ADT for home security. However, they usually require proprietary hubs to check their status, and don't offer easily accessible APIs to interface with the device. Luckily, there was a better solution!

## Zigbee!

Enter Zigbee. It's a low-rate mesh wireless protocol that allows for smart devices to communicate over a personal area network. A benefit of this is that you're able to use one hub to communicate with a variety of devices, even those made by different manufacturers. Instead of searching for a particular brand for the door contact sensors, I would just have to find ones that supported the Zigbee protocol. Then I would be able to view their status through Home Assistant's dashboard.

It's important to note that Zigbee radios operate independently from WiFi or Bluetooth antennas. If you want to interface with Zigbee devices, you'll have to pick up a special receiver that can support the protocol. For this project, I grabbed [this one](https://www.amazon.com/SONOFF-Universal-Assistant-Zigbee2MQTT-Wireless/dp/B0B6P22YJC/) made by SONOFF. Home Assistant's Zigbee integration is called [Zigbee Home Automation](https://www.home-assistant.io/integrations/zha/), and it supports a variety of Zigbee coordinators (the USB dongles that allow for connections). When you use this integration, Home Assistant automatically creates a Zigbee network that the devices can join.

I decided to use [these Aqara door and window sensors](https://www.amazon.com/Aqara-MCCGQ11LM-Window-Sensor-White/dp/B07D37VDM3/) for this project. They had the best reviews out of all of the Zigbee door sensors I looked at, and have a battery life of two years (with an easily replaceable CR1632 cell).

Once the coordinator and sensors arrived, I created a Home Assistant login and installed the ZHA integration. Pairing simply required holding the "reset" button on the sensors until Home Assistant recognized them and added the corresponding entities in the dashboard.

<div style="display: flex; justify-content: center; gap: 12px; max-width: 100%; flex-wrap: wrap; margin-bottom">
    <figure style="max-width: 300px; text-align: center; margin: 0;">
        <img src="/images/upl-pc/rpi_wall.png" alt="An image of a Raspberry Pi suspended from a wall with various cables plugged into it. There's a USB stick with an antenna sticking out." style="max-height: 300px; width: auto; max-width: 100%;" />
        <figcaption style="font-style: italic; font-size: 0.95em; margin-top: 10px;">Raspberry Pi with Zigbee coordinator</figcaption>
    </figure>
    <figure style="max-width: 300px; text-align: center; margin: 0;">
        <img src="/images/upl-pc/sensor_wall.png" alt="An image featuring a door contact sensor. The door is cracked open, and the sensors are nearly making contact." style="max-height: 300px; width: auto; max-width: 100%;" />
        <figcaption style="font-style: italic; font-size: 0.95em; margin-top: 10px;">Aqara door contact sensor on the open door</figcaption>
    </figure>
</div>

## Using the door statuses

Once this was all configured, I had the live statuses of the doors through the Home Assistant dashboard! I'm not going to lie, it was really fun opening and closing the doors repeatedly and seeing the dashboard change in real-time (even if passerby in the CS building probably thought I was crazy).

<div style="display: flex; justify-content: center; gap: 10px; max-width: 100%; flex-wrap: wrap; margin-bottom: 0;">
    <video src="/images/upl-pc/doors.mp4" controls style="max-height: 250px; width: auto; max-width: 100%; height: auto;">
    Your browser does not support the video tag.
</video>
</div>

<i style="display: flex; justify-content: center; margin-top: 10px; font-size: 0.95em;">It's so satisfying to watch this happen in real-time.[^3]</i>

An important thing to note here is that UWNet provides total access point isolation. None of the devices on the network can see any of the others (for good reason, as it would be a huge security vulnerability for any devices with open ports). If this wasn't a limitation, I would just have the website directly query the rpi.

My first intuition was to use Home Assistant's [RESTful Command](https://www.home-assistant.io/integrations/rest_command/) integration to send a POST request to my webserver whenever the status of the doors changed. These require you to setup each command ahead of time, in HA's `configuration.yml`:

```yaml title="configuration.yml"
rest_command:
  door1_opened:
    url: "https://doors.amoses.dev/door1/open"
    method: POST
    headers:
      content-type: "application/json"
    payload: '{"door": "door1", "state": "open"}'
    content_type: "application/json; charset=utf-8"

  door1_closed:
    url: "https://doors.amoses.dev/door1/close"
    method: POST
    headers:
      content-type: "application/json"
    payload: '{"door": "door1", "state": "closed"}'
    content_type: "application/json; charset=utf-8"

  door2_opened:
    url: "https://doors.amoses.dev/door2/open"
    method: POST
    headers:
      content-type: "application/json"
    payload: '{"door": "door2", "state": "open"}'
    content_type: "application/json; charset=utf-8"

  door2_closed:
    url: "https://doors.amoses.dev/door2/close"
    method: POST
    headers:
      content-type: "application/json"
    payload: '{"door": "door2", "state": "closed"}'
    content_type: "application/json; charset=utf-8"
```

...but I very quickly realized that this solution wasn't the best. For one, when I published [the source code](https://github.com/UW-UPL/people-counter-v2/blob/main/home-assistant/configuration.yaml) onto GitHub, some very funny students decided that they would manually simulate the POST requests and change the status of the doors to be inaccurate. That's what I get for leaving the endpoint unsecured![^4]

I eventually learned that Home Assistant provides a [RESTful API](https://developers.home-assistant.io/docs/api/rest/) directly alongside the web dashboard. If I set that up, I would be able to query the instance for the states of the connected devices.[^5] All it took was appending an `/api/` route to the HA URL. I could just use that!

The API has all of its routes authenticated with a bearer token (to most likely mirror the permissions of the frontend, which requires a user login before showing any data). Given that I wanted to display the door status on the UPL's page, I realized the potential danger in shipping the bearer token with the site. Any crafty user could take it and access any other route on Home Assistant's API. Given the level of information and control available on HA instances, this could be disastrous.

I made a quick webserver using Express that proxies the request with the bearer token and only serves the relevant door information. Because it displays this separately, the user has no way of seeing or manipulating anything beyond this.

```js title="server.js" collapse={1-7, 43-53}
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3500;

const apiUrl = "https://HOMEASSISTANT-URL-HERE/api/states";
const token = "Bearer TOKEN-GOES-HERE";

app.use(cors());

app.get("/door-status", async (req, res) => {
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: token,
      },
    });

    const data = response.data;

    // grab the items with the appropriate HA entity ids
    const doors = data.filter(
      (item) =>
        item.entity_id === "binary_sensor.back" ||
        item.entity_id === "binary_sensor.front"
    );

    // extract status and last updated information
    const doorStatus = doors.map((door) => ({
      door: door.attributes.friendly_name,
      status: door.state,
      last_updated: door.last_updated,
    }));

    // send the filtered data as a json response
    res.json(doorStatus);
  } catch (error) {
    res.status(500).send("Error fetching data");
  }
});

// :P
app.get("/", async (req, res) => {
  res
    .status(200)
    .send("<html><body><b>wow upl door status endpoint 443</b></body></html>");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

Now, the server will query Home Assistant's API on your behalf (with the proper bearer token). It'll return a JSON object of the door statuses and their last change, like so:

```json title="response.json" showLineNumbers=false
[
  {
    "door": "back",
    "status": "on",
    "last_updated": "2024-10-12T20:01:54.353657+00:00"
  },
  {
    "door": "front",
    "status": "on",
    "last_updated": "2024-10-12T20:02:10.132178+00:00"
  }
]
```

...and the Discord bot/UPL website can use that to let people know what the status is.

<div style="display: flex; justify-content: center; gap: 10px; max-width: 100%; flex-wrap: wrap; margin-bottom">
    <img src="/images/upl-pc/open_door.png" alt="The UPL website reads 'the doors are open!' with an icon of an open door." />
</div>

<i style="display: flex; justify-content: center; margin-top: 10px; font-size: 0.95em;">The UPL website uses a header component which fetches the door status every 15 seconds.</i>

<div style="display: flex; justify-content: center; gap: 10px; max-width: 100%; flex-wrap: wrap; margin-bottom">
    <img src="/images/upl-pc/upl_discord.png" alt="A channel in the UPL Discord reads 'UPL doors open'." />
</div>

<i style="display: flex; justify-content: center; margin-top: 10px; font-size: 0.95em;">The Discord channel name is an easy way to see the status without opening the site.</i>

## Conclusion

I'm pretty happy with how this project turned out. It's been really fun developing something that I actually use every day, and I find it pretty special that every time I check if the UPL's open or not, I'm doing it via something that I made myself.

<br>

---

<br>

[^1]: I'm sure that you could apply various transformations to the image to mask out that area from detection. But people occasionally sit in it!

[^2]: If you've ever lived in the UW dorms, you'll know all too well what I'm talking about. Every device without browser access needs to have its MAC address whitelisted by the network system. This authorization expires in six months, so you'll lose internet access and have to renew.

[^3]: The UPL has a front and back entrance, hence the wording being "doors" instead of "door".

[^4]: Before you try, these endpoints aren't in use anymore. :P

[^5]: Keen eyed readers might be asking "what about the AP isolation issue that you just mentioned?!". Well, I found a fantastic addon for Home Assistant that allows you to access your dashboard (and the API, by extension) when not on the LAN of the pi. It uses Cloudflare tunnels, and you can find [its GitHub repository here.](https://github.com/brenner-tobias/addon-cloudflared)
