---
title: 'Stepping into the world of OT Penetration Testing with Alchemy'
date: 2024-12-24T10:54:32+01:00

footer: 'Jakob Friedl © 2024' 

categories: ['hackthebox']
blog_post: true
---

After having completed all the previous Pro Labs, I was extraordinarily exited when HackTheBox announced their newest training lab Alchemy. Although originally being exclusive to enterprise users, the lab was released to the public a few months later.  This blog post contains an introduction into the world of operational technology, a review of the Alchemy Pro Lab and an overview of the things I learned while solving it.<!--more-->

![Alchemy](/img/htb-labs-3/alchemy.svg)

In contrast to the labs I previously wrote about in [this](/blog/offshore-rastalabs-zephyr) and [that](/blog/cybernetics-aptlabs) blog post, Alchemy not only focuses on vulnerabilities and misconfigurations in IT systems, but also encompasses OT security concepts, which make the whole engagement feel a lot more involving and impactful. 

Among others, Alchemy covers the following areas: 

- Enumeration of IT and OT networks
- Identifying & exploiting misconfigurations
- Web application attacks
- Lateral movement & privilege escalation techniques
- Tunneling & pivoting
- Documentation analysis
- Network traffic analysis
- In-depth understanding of the Modbus protocol
- Structured text (.st) PLC code review

## What is Operational Technology? 

In contrast to information technology (IT), which deals with data systems, operational technology (OT) mainly revolves around the control of physical or industrial equipment. OT is made up of software and hardware used to manage, secure and control industrial control systems (ICS) systems, devices and processes in the OT environment. OT devices are physical components or systems used to monitor, control, or automate industrial processes. These devices interact directly with machinery, infrastructure, and physical systems, enabling real-time operations in sectors like manufacturing, energy, utilities, and transportation. In the following, some of the most common OT devices are introduced[^1]. 

- *Programmable Logic Controllers (PLCs)*: PLCs are specialized industrial computers designed to monitor, control, and automate processes or machinery in real-time. PLCs use ladder logic, structured text, or function block diagrams to define how inputs should be processed and what outputs should be generated. They communicate with other systems via industrial communication protocols like *Modbus*
- *Human Machine Interfaces (HMIs)*: A HMI is a user interface or dashboard that allows operators to interact with machines, systems, or processes in industrial environments. HMIs provide real-time information about the status, performance, and control of machines or systems, enabling users to monitor and manage operations effectively.
- *Supervisory Control and Data Acquisition (SCADA)*: SCADA systems are  used in industrial and infrastructure environments to monitor, control, and collect data from equipment and processes, often across geographically dispersed locations.

![Structure of IT/OT environments](/img/htb-labs-3/ot-architecture.png)

### Modbus

Modbus is a serial communication protocol from 1979 for use with programmable logic controllers (PLCs). In simple terms, it is a method used for transmitting information over serial lines between electronic devices. The device requesting the information is called the Modbus Master and the devices supplying information are Modbus Slaves[^2]. 

In Modbus, there are *coils* and *holding registers*. Coils are used to handle binary (on/off) states while holding registers handle data which controls settings or outputs. There are also input registers, which are read-only and hold sensor data or other inputs. Modbus supports a series of function codes that can be used to interact with coils and registers. The function code in the request tells the addressed slave device what kind of action to perform. The data bytes contains any additional information that the slave will need to perform the function. For example, function code `0x03` will request the slave to read holding registers and respond with their contents. The data field must contain the information telling the slave which register to start at and how many registers to read.[^3] 

| **Function Code** | **Function Name**                  | **Description**                                                |
|--------------------|------------------------------------|----------------------------------------------------------------|
| `0x01`             | Read Coils                        | Reads the status of a block of coils (on/off).                 |
| `0x02`             | Read Discrete Inputs              | Reads the status of a block of discrete input bits (on/off).   |
| `0x03`             | Read Holding Registers            | Reads the contents of a block of holding registers.            |
| `0x04`             | Read Input Registers              | Reads the contents of a block of input registers.              |
| `0x05`             | Write Single Coil                 | Sets the status of a single coil (on/off).                     |
| `0x06`             | Write Single Register             | Writes a single value into a holding register.                 |
| `0x0F`             | Write Multiple Coils              | Sets the status of multiple coils (on/off).                    |
| `0x10`             | Write Multiple Registers          | Writes multiple values into holding registers.                 |
| `0x17`             | Read/Write Multiple Registers     | Performs a combination of read and write operations on registers.       |

The OT section in Alchemy revolved around understanding und interacting with the Modbus communication process between HMIs and PLCs to make the devices behave in unpredictable ways. More about the Pro Lab itself is discussed in the subsequent sections. 

## Alchemy Pro Lab Review

The Alchemy Pro Lab simulates a external security assessment of the *Sogard Brewing Co.* in form of a red team engagement. The overall objective of the engagement was to determine whether brewery operations can be disrupted based on the current architecture. The attacker was tasked with assessing the company's public interface (i.e., the IT network) and emphasize the weaknesses allowing an adversary to impact the physical process or steal the brewery's Intellectual Property. 

The only information disclosed at the start of the engagement was the IP-address of the entry point web application of the brewery. From there, the lab environment was basically divided into three sections. An IT section containing the office network and corporate Active Directory, a smaller and segmented OT control section and a third network segment, housing the *HMI*'s and *PLC* devices. Like all the other Pro Labs, Alchemy had a total of 21 flags to be collected. In the IT network, those flags were usually found on compromised hosts but to get the OT flags, the attacker was required to either obtain sensitive information about the brewing recipe or make the device behave unexpectedly or unsafely. 

While the IT section was very straightforward and simple, the exploitation of PLC logic proved to be much more complex. To recreate a realistic OT environment, HackTheBox created a fictional manufacturer of the different types of PLC devices. Throughout the lab, I was able to amass a variety of documentation about these devices in the form of datasheets, release notes and source code, which helped developing my understanding of the inner workings of the technology. I really appreciated to amount of effort that was put into creating the custom documents which made the lab feel a lot more immersive and fun rather than having only the most relevant information in a simple text file. Due to this, I was essentially forced to read and understand the technical aspects like the Modbus protocol and uncover ways to mess with the intended functionality. 

Even though there were multiple PLC's, they all felt unique and each offered distinct misconfigurations, from outdated software with known vulnerabilities to access control restrictions or even IT-typical vulnerabilities on the HMI websites. All in all, the Alchemy Pro Lab taught me that I enjoy exploiting weaknesses more when they require in-depth understanding of the technical processes and thorough research in associated documentation or the internet, rather than simply copying and executing a public exploit from GitHub. While the later is fun too, building a successful exploit chain tailored to the target after getting how it works just feels a lot more rewarding. 

## Lessons Learned

As with all Pro Labs, Alchemy again provided me with an opportunity to discover new tools and techniques. One of the most interesting tools I found useful during the engagement was the Printer Exploitation Toolkit ([PRET](https://github.com/RUB-NDS/PRET)). This framework allowed for easy interaction with network printers, allowing for instance the retrieval of sensitive information. PRET will be a go-to tool when discovering printers on future penetration tests or red team engagements. 

Another huge focus point of the OT area was understanding and interaction with the Modbus protocol. I personally used a combination of tools for this purpose:

- [modbus-cli](https://github.com/tallakt/modbus-cli): A useful command line tool for enumerating and querying coils and registers
- [pymodbus](https://github.com/pymodbus-dev/pymodbus): A Python library for interacting with PLC devices that communicate via the Modbus protocol. Especially useful for creating scripts for more complex exploits that require multiple steps. It is also very well [documented](https://pymodbus.readthedocs.io/en/latest/) which made picking it up and using it very straightforward. 

Finally, the biggest lesson I took away from the Alchemy Pro Lab was the importance of securing ICS/OT environments. Systems in these environments have mostly not been designed with security in mind. The combination of outdated operating systems and legacy software with known vulnerabilities and misconfigurations and the fact that these systems are used to control multi-million euro machinery leads to OT networks being an attractive target for threat actors and nation-state hackers. Downtime of those machines can lead to immense loss of revenue and and threat actors might even be able to steal sensitive intellectual property like blueprints and secret recipes. In critical sectors like energy, transportation and water supply, exploitation of OT devices can lead to catastrophic consequences in both security as well as safety. 

The importance lies in properly segmenting OT networks from IT networks to prevent unauthorized access to HMI's and PLC's that could compromise the availability, integrity and confidentiality of OT systems, as well as testing PLC devices for misconfigurations that could lead to malicious modifications or information disclosure. 

## Conclusion

All in all, I personally consider Alchemy to be the most fun Pro Lab that HackTheBox offers. While the difficulty of the IT section compares to the Dante, the OT challenges provide a lot of learning opportunities for new technologies and out-of-the-box thinking. The scenario and custom documents were incredibly well crafted and made the whole experience feel a lot more immersive and captivating. I recommend checking out Alchemy to anyone interesting in learning about OT penetration testing, as it provides a good learning opportunity for key concepts in this field.

That all being said, I wish you a ***Merry Christmas*** and an insightful 2025!

[^1]: https://www.checkpoint.com/cyber-hub/network-security/what-is-operational-technology-ot-security/
[^2]: https://www.simplymodbus.ca/FAQ.htm
[^3]: https://www.modbustools.com/modbus.html