---
layout: "../../layouts/Blog.astro"
title: "It's your fault my laptop knows where I am"
pubDate: "2025-11-03"
description: "How dare you!"
tags: ["investigations", "uw"]
author: "Andrew"
bestof: true
---

## Attendance

I'm in [Introduction to Algorithms (577)](https://guide.wisc.edu/courses/comp_sci/#:~:text=COMP%C2%A0SCI%C2%A0577%20%E2%80%94%20INTRODUCTION%20TO%20ALGORITHMS) this semester at UW, and I've been enjoying hearing Renault explaining how to prove program correctness, DP, network flow, and the circumstances under which Dijkstra invented his shortest-path algorithm. 


However... algos is a somewhat unique class for me, given that it's the first course I've taken that mandates being present during lectures by taking attendance. It accomplishes this through a platform called [TopHat](https://tophat.com/), who many students will recognize through its use of displaying participation questions.

TopHat asks you to provide it a four-length numerical code (that'll be provided to you by your lecturer) in order to verify that you're actually in the location where the attendance is being taken. You type that code into the student TopHat page, and, bam, you're marked present. 

However, I suppose they caught on to the unpatchable strategy of Having Friends, who, given that they are in the same class section as you, can be sent messages begging for the code from the comfort of your bed.

So, for the paranoid lecturer, TopHat allows "[secure attendance](https://support.tophat.com/article/Educator-Taking-Attendance#SecureAttendance)", a feature which, according to them, determines your location as "...determined by [your] device geolocation or by both geolocation and proximity (to the classroom and other students)."

<div style="display: flex; justify-content: center; gap: 10px; max-width: 100%; flex-wrap: wrap; margin-bottom">
    <img src="/images/wifi-location/tophat.png" alt="TopHat's attendance code feature showing secure attendance enabled" style="max-height: 350px; width: auto; max-width: 100%;" />
</div>

The first time I heard about this system, I wondered how much leeway this "geolocation" would afford you. There exist a plethora of traditional "IP geolocation" services, which use your IP address and [ASN](https://en.wikipedia.org/wiki/Autonomous_system_(Internet)) -- both semi-unique identifiers sent to the webpage upon load -- to try and identify your location. This provides... varied results depending on where you're located. When in Madison and NYC, popular IP geolocation services have been able to pin me within a mile or so of my actual location. In any suburban area, the error jumps to city-level.[^1] Surely TopHat wouldn't be relying on such an inaccurate measure of detecting location when determining attendance -- students living in Chadbourne Hall taking lectures in Mosse Humanities (approx. 250ft apart) would be able to skirt the attendance requirement. That could be catastrophic!

## The Geolocation API

Alas, it is not IP geolocation being used by TopHat. As aforementioned, IP geolocation is a pretty implicit flow -- webpages are able to see your IP when you connect to them. However, when trying to determine your location, TopHat pops up a big scary dialogue past the [line of death](https://textslashplain.com/2017/01/14/the-line-of-death/)! 

Clearly this is asking something else entirely -- something that's presumably so precise as to require my explicit consent.

I'll spare you the suspense. This is the Geolocation API, a feature of all modern browsers that allows the retrieval of your location to a *much* more precise degree (hence the permission pop-up). As of writing this post, IP geolocation is enough to place me somewhere in the Lakeshore neighborhood of Madison (1-2 miles long), but Chrome's Geolocation API is enough to pin me to the exact building -- Morgridge Hall -- I'm sitting in. That's orders of magnitude more accurate.

When I first experienced my laptop doing this, my first thought was "How?" There's nothing special that my laptop has access to that would somehow allow my browser to have a more specific location... right? My laptop doesn't have a GPS receiver in it[^2] that would allow location identification in the same way that phones can (and it isn't just piggybacking off of my phone's GPS, since this same location API is available on Windows devices).

### It's all of our faults

When you press "allow" on the popup, your browser uses an accuracy heuristic to determine which method fetches the most accurate location. While this could be GPS (if on a cellular-enabled device) or the aforementioned IP geolocation, it will most likely have the highest success with the **Wi-Fi Positioning System**, a strategy that uses the wireless access points around you to identify your location.

Here's how it works. After allowing your browser permission to access your location, a website has access to the `getCurrentPosition()` function. When calling it, your browser kindly asks your operating system for a list of the surrounding Wi-Fi access points -- more specifically, their signal strength, SSIDs, and BSSIDs.

If those last two are foreign to you, the "SSID" of a network is just the friendly name -- for example, `UWNet` or `eduroam`. The BSSID is the MAC address of the access point, which is unique per each device. Having a unique identifier *per access point* is immensely important, as you can imagine just how many APs are named the same thing. Take a look at the map of APs around campus named `UWNet`:

<div style="display: flex; justify-content: center; gap: 10px; max-width: 100%; flex-wrap: wrap; margin-bottom">
    <img src="/images/wifi-location/wigle-madison.png" alt="A map of Madison, Wisconsin, with a purple hotspot over the downtown area" style="max-height: 325px; width: auto; max-width: 100%;" />
</div>

Okay, so, great. We now know exactly which Wi-Fi network you're connected to. But how does this translate to your location on a map? And how do we even know where these networks are in the real world?

### Wardriving

The notion of associating Wi-Fi networks with their physical locations has been prevalent since the early 2000s. As far as I can tell, [Skyhook Wireless](https://en.wikipedia.org/wiki/Skyhook_Wireless) were the first to do it on a commercially-available scale, using a technique known as [wardriving](https://en.wikipedia.org/wiki/Wardriving). This entails getting in a vehicle and driving around while capturing the information of as many Wi-Fi networks as possible. Since the devices doing the network scanning also have a reliable knowledge of their position (through GPS), all you have to do is associate the location of *where you saw the network* with its signal strength. Some RSSI trilateration later, and you have a roughly accurate map of Wi-Fi networks you've seen and their corresponding physical locations.

The useful thing is that, once in possession of all of this data, you can perform the process in reverse -- on a user's device, send a list of the Wi-Fi networks you can see (and their corresponding [RSSI](https://en.wikipedia.org/wiki/Received_signal_strength_indicator)), and receive an approximate guess on where that places your device in the world. For a while, that's what everyone's devices (including Apple ones, until iOS 3.2) did, relying on either Skyhook's or Google's privately collected list. The latter, interestingly enough, used their Street View vehicles (the ones taking images of roads) to capture the Wi-Fi information for a while.

However, at some point, companies realized the potential benefit of sourcing this information from the users of their devices. After all, they're already frequently checking their GPS location and phoning home to cell towers, so why not send some anonymized Wi-Fi location data along with it?

So, that's what Apple, Google, and Microsoft devices began doing. The location services of their products, by default, started aggregating the SSIDs and BSSIDs of Wi-Fi hotspots they could see (and their locations) and logging them for others' devices to use for more accurate location services. And... that's more or less the same thing that modern devices use today. When Chrome tells me that a website would like to use my location, and I allow it, the list of the surrounding hotspots will be sent to Google -- which, because tens of thousands of people with GPS-enabled devices have also pinged the networks, allows my computer to obtain an extremely accurate estimation on where I am. So, thank you, everybody...?

## Controversy

If you were feeling a little nervous about the idea of your phone aggregating and sharing the location and information of every Wi-Fi network you've ever interacted with in your entire life, don't worry, you're not alone! There have been plenty of historical incidents with abuses of the technology.

Starting with a tough one: remember how earlier (in [wardriving](#wardriving)) I mentioned that Google historically used their Street View cars to obtain network information for their location services? It turns out that they were sniffing much more than just the headers of the packets -- they were aggregating the raw 802.11 Wi-Fi data frames, which includes the non-encrypted payload of HTTP packets. I assume that very little of the internet was using HTTPS in 2010, so the reported 600 gigabytes worth of data they obtained definitely contained some things that users would probably rather them not see. 

A larger and more pertinent concern tends to crop up with regards to the possibility of tracing someone's location -- which is valid, given its sensitivity. This has been a worry since WPS' inception, but one older example I found was Elie Bursztein et al.'s talk and [accompanying blog post](https://elie.net/blog/privacy/using-the-microsoft-geolocalization-api-to-retrace-where-a-windows-laptop-has-been) "Using the microsoft geolocalization api to retrace where a windows laptop has been". At the time, there was a bug where Windows would save a persistent record of every MAC address that you connected to, making it possible to retrace someone's steps (thus, tracking their location as it changed) using one of numerous location APIs live at the time.

These vulnerabilities are even seen in contemporary times -- Erik Rye and Dave Levin of the University of Maryland wrote "[Surveilling the Masses with Wi-Fi-Based Positioning Systems](https://arxiv.org/abs/2405.14975)" in 2024, detailing a flaw in Apple's location services that allowed them to exfiltrate the positions of nearly two billion BSSIDs by cleverly filtering the MAC address space they were searching. Their paper's great, and it touches on some real dangers possible from the information in the hands of an adversary, such as stalking individuals by continuously locating their router BSSID, or monitoring population density during wartime by observing the movement of groups of devices (and satellite internet constellations like Starlink).

Over time, the location service providers have improved the security of the APIs they develop. This is *supremely* important given the risks we've discussed, especially given that nearly every device created by these companies are, by default[^3], sending this information to their manufacturers. Nearly every company that participates in WPS allows you to opt your BSSID out -- either by changing the name of your SSID or by specifying the MAC address in a form somewhere:

<div style="display: flex; justify-content: center; gap: 10px; max-width: 100%; flex-wrap: wrap; margin-bottom">
    <img src="/images/wifi-location/apple-wps.png" alt="Apple support WPS opt out page" style="max-height: 325px; width: auto; max-width: 100%;" />
</div>

<i style="display: flex; justify-content: center; margin-top: 10px; font-size: 0.95em;">Apple's instructional opt out page (appending <code style="margin-left: 5px;">_nomap</code>) to the SSID.</i>

<div style="display: flex; justify-content: center; gap: 10px; max-width: 100%; flex-wrap: wrap; margin-bottom">
    <img src="/images/wifi-location/google-wps.png" alt="Google support WPS opt out page" style="max-height: 325px; width: auto; max-width: 100%;" />
</div>

<i style="display: flex; justify-content: center; margin-top: 10px; font-size: 0.95em;">Google's page, which offers the same advice.</i>

<div style="display: flex; justify-content: center; gap: 10px; max-width: 100%; flex-wrap: wrap; margin-bottom">
    <img src="/images/wifi-location/microsoft-wps.png" alt="Microsoft support WPS opt out page" style="max-height: 325px; width: auto; max-width: 100%;" />
</div>

<i style="display: flex; justify-content: center; margin-top: 10px; font-size: 0.95em;">Microsoft's form, requiring a BSSID submission to opt out.</i>

## Conclusion

If I didn't mention it yet, this technology does have a name. It's called the [Wi-Fi positioning system](https://en.wikipedia.org/wiki/Wi-Fi_positioning_system) (WPS). There's still a vibrant community of Wi-Fi positioning enthusiasts out there -- https://wigle.net/ is a crowd-sourced database from recreational wardrivers who have contributed nearly two billion networks over the last 25 years. You can zoom in on your town and see the Wi-Fi density near you, and you can even check if your own network has been tagged by someone else!

I'd also be remiss if I didn't mention https://beacondb.net/, a self described "public domain wireless geolocation database", which, while I haven't had time to play with, sounds like a very promising open version of the trackers so commonly used nowadays. While it doesn't have as dense of a database as any of the other providers, I actually think it's neat to have a lack of homogeneity among the smaller providers -- it shows the data is truly different!

It's been really fun diving down this rabbit hole to learn how our devices gain access to our location. It's one of the more niche things that I've taken for granted when using my devices, and it certainly didn't occur to me that, while in lecture, the only reason I could be marked present was because thousands of other students had (without their knowledge) pinged servers all over the world.

<br>

---

<br>


[^1]: This conclusion -- "error rates scale based on living settlement density" is my personal conjecture. It is surprisingly frustrating just exactly how little information there is online about how these services attempt to pin your location from *just* your IP address. Wikipedia [has an article](https://en.wikipedia.org/wiki/Internet_geolocation) about IP geolocation, but it's vague when discussing the actual implementation details...

[^2]: Small digression: did you know that, until May 2000, GPS satellites (which are owned and operated by the United States Space Force) provided the general public a signal with intentional error built into it? This was called [Selective Availability](https://en.wikipedia.org/wiki/Error_analysis_for_the_Global_Positioning_System#Selective_Availability), and it augmented the position of GPS readings by about 50 meters (162 feet) horizontally. It was shut off for a number of reasons -- one of which being that [Differential GPS](https://en.wikipedia.org/wiki/Differential_GPS) allows you to circumvent the distortion trivially by comparing the error of the signal against the location of a reference station with a known position.

[^3]: It's associated with "Location Services" on most devices, meaning that you cannot opt out of your phone reporting the locations of surrounding Wi-Fi devices without turning off your phone's ability to obtain its location entirely.