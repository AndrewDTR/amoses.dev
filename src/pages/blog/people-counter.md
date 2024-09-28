---
layout: "../../layouts/Blog.astro"
title: "Revamping the UPL's people counter"
date: "2024-09-28"
subtitle: "who knew figuring out whether the lab's open would be so much work...?"
tags: ["python", "opencv", "zigbee", "upl"]
---

## A History of UPL's Cameras

For almost as long as [the Undergraduate Projects Lab](https://www.upl.cs.wisc.edu) has existed, there's been a camera of some sort peering at the room. There's evidence of a system existing even as far back as the 1990s, with a [prehistoric revision of the site](https://web.archive.org/web/19981202092257/http://www.upl.cs.wisc.edu/cgi-bin/uplcam.html) mentioning that an old iteration was:

> ...a $15 video camera attached to the wall with duct tape, connected to a VCR, connected to a video spigot in a Mac IIcx, running Timed Video Grabber (TVG), and FTPd. Dax, an HP workstation ran a script that would try to FTP the latest image every 60 seconds. Because the clocks would drift, occasionally, the file accesses would collide, and the whole scheme would break.

Just _reading_ that makes me stare at the C920 that now sits perched on top of the arcade cabinet with wonder. What used to be several thousand dollars of equipment is now achievable (with immeasurably better quality) with a $50 webcam plugged into a Raspberry Pi.

<div style="display: flex; justify-content: center; gap: 10px; max-width: 100%; flex-wrap: wrap; margin-bottom">
    <img src="/images/upl-pc/old_upl.png" alt="Image 1" style="max-height: 250px; width: auto; max-width: 100%;" />
    <img src="/images/upl-pc/new_upl.jpeg" alt="Image 2" style="max-height: 250px; width: auto; max-width: 100%;" />
</div>

<p style="display: flex; justify-content: center; margin-top: 10px; font-size: 0.95em;">Taken ~25 years apart</p>

I could--and probably will--write an entire other blog post about the intricate history of the UPL, mentioning how [older versions of the website](https://web.archive.org/web/20001003051528/http://www.upl.cs.wisc.edu/uplcam/spincam.html) allowed for users to control the tilt and pan of the camera using four stepper motors attached to the camera.

However, the focus in this article is about the two _latest_ iterations of cameras in the UPL.

## &#8220;Is the UPL open right now?&#8221;

I'm sure that any UPL member can testify the horror of arriving to the lab to see a closed door. If you live anywhere off campus, it's heartbreaking to see your arduous trek to the CS building result in failure.

There's no doubt that as far back as IRC, members of the UPL messaged each other asking if the lab was open. With the advent of mobile phones, it's gotten easier to bother your friends--who may not even be in the room!

Well, myself, in collaboration with other UPL members, decided to fix this issue in, perhaps, the most CS-student-esque way possible: an automated system to identify the exact number of people in the lab.