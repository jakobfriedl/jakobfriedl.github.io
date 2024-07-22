---
title: 'Kerberos Authentication Protocol'
date: 2023-10-10T20:15:37+02:00

footer: 'Jakob Friedl © 2023' 

categories: []
blog_post: true
---

I decided to publish this blog post after completing an assignment for university, where I had to explain the Kerberos authentication protocol in detail, as well as implement a working example on a Linux Slackware virtual machine. Since I gathered a lot of information about this topic and I feel like it is a very interesting topic, I decided to share my knowledge with you and attempt to explain the workings of the protocol in a graspable manner. Since I am a passionate penetration tester, I will also cover some attack vectors that can be used to exploit Kerberos, especially in regard to Active Directory environments. A detailed explanation of these attack vectors is, however, out of scope of this blog post. 

<!--more-->

## Overview 

The Kerberos protocol provides a single-sign-on (SSO) mutual authentication solution for insecure networks or hosts, where clients and servers verify each others identity based on symmetric-key cryptography and a ticket-based authentication system. Most commonly used in Windows Active Directory environments, a user only has to enter their password once to be able to access a multitude of servers, shares or other resources, while the password is never directly sent across the network, unlike in less secure alternatives like NTLM.

The name Kerberos stems from the three-headed dog Cerberus, who in Greek mythology guards the gates of the underworld. Similarly, Kerberos is used to guard a network from unwanted and unauthenticated users. It was developed by the Massachusetts Institute of Technology (MIT) in 1988, with it's current version, Kerberos Version 5 having been initially published in 1993 and reworked to meet security standards in 2005. The protocol is open source and has been built into Windows as the default authentication mechanism since Windows 2000.

## Components

The domain or network where Kerberos is the authentication authority is called a Kerberos realm. Subjects like users or services in a **realm** are called **principals** and have a unique identifier assigned to them. The most important component of a Kerberos realm is the **Key Distribution Center (KDC)** which is usually located on the domain controller in an Active Directory environment. The KDC consists of two servers, the **Authentication Server (AS)**, which is responsible for verifying user's credentials against the Kerberos database which stores the secret symmetric keys of all principals, as well as the **Ticket Granting Server (TGS)**, which is tasked to issue tickets to the authenticated user that allow them to access the desired services. There a two forms of tickets used with Kerberos authentication. A **Ticket Granting Ticket (TGT)** is obtained after successful authentication to the AS and allows for the retrieval of **Service Tickets (ST)** from the TGS, which are then used by the user to access the service they want to use. There is also another message type known as the **Authenticator**, which is used to verify the identity of the user to a service. 

![History of Kerberos](/img/kerberos/components.png)

## Workflow

The Kerberos authentication process[^videos] consists of 6 steps that ensure mutual authentication between a client and a resource server and that the user can access the desired service. I have created a diagram that shows the workflow of the authentication process, which I will explain in detail below.

1. *AS_REQ (Authentication Server Request)*: The user sends an message containing their username or ID and the SPN (Service Principal Name) of the service they want to access to the AS. In this message, the SPN is krbtgt, the service account of the TGS that is responsible for issuing tickets. The requested lifetime of the TGT is also included, as well as a nonce, a random number which helps protect the system against replay attacks. This step is where the actual authentication happens, since the user is required to enter their password to generate their secret key. This secret key is used to encrypt a timestamp in the message, to ensure the authenticity of the user that requests the TGT. This process is known as pre-authentication and is used to prevent replay attacks and verify the user's authenticity to the KDC.

2. *AS_REP (Authentication Server Response)*: Upon receiving the AS_REQ message, the authentication server verifies that the user ID exists in the Kerberos database, encrypting the PA-data (pre-authentication data) of message with the stored secret key afterwards. If the authentication is successful, the AS sends two encrypted messages to the client. The first message contains the TGS's ID, a timestamp, the lifetime of the TGT and a randomly generated symmetric **TGS Session Key**. This message is encrypted with the clients secrets key that was fetched from the Kerberos database. The second message is the Ticket Granting Ticket and again contains the user's and TGS's ID, a timestamp, the TGT lifetime and the same TGS Session Key. However, the TGT is encrypted with the secret key of the TGS instead. More precisely, the TGT is encrypted with a key created from the password hash of the krbtgt account.

3. *TGS_REQ (Ticket Granting Server Request)*: The client again needs their secret key to decrypt the first message, send by the KDC. If valid credentials are supplied, this provides access to the mutual TGS Session Key. Note that the TGT, however, cannot be decrypted, since the user does not have access to the TGS's secret key. Instead, the TGT is forwarded to the TGS along with two new messages. An unencrypted message containing the desired service's SPN and the requested ST lifetime as well as an authenticator message with user ID and timestamp, which is encrypted with the TGS Session Key are sent to the TGS.
    
4. *TGS_REP (Ticket Granting Server Response)*: The TGS starts with verifying that the requested service exists in the Kerberos database on the KDC. Then, the TGS decrypts the TGT with the TGS secret key to obtain the TGS Session Key, which can in turn be used to decrypt the user authenticator message. The TGS then performs validation on the request by comparing user IDs, timestamps and ticket lifetimes. Additionally, the TGS features a cache that contains recent authenticators to protect against replay attacks, which would allow authentication on behalf of other users. After successful validation, the TGS creates two new messages and sends them back to the user. The first one contains the service ID and a timestamp, as well as a new symmetric **Service Session Key**. This message is encrypted with the TGS Session Key. The second message is the Service Ticket, containing user and service IDs, a timestamp the ST lifetime and the same Service Session Key. This message is encrypted using the desired service's secret key, fetched from the Kerberos database.

5. *AP_REQ (Application Server Request)*: The user can decrypt the first received message using the TGS Session Key and obtains the Service Session Key. Again, the ST cannot be decrypted, since the user does not have access to the service’s secret key. Instead, the ST is forwarded to the service along with a user authenticator message containing user ID and timestamp, which is encrypted using the Service Session Key.

6. *AP_REP (Application Server Response)*: The service now uses it's own secret key to decrypt the Service Ticket and is thus able to obtain the Service Session Key. After this key is used to decrypt the user authenticator message, the service validates the data received like the TGS previously did and checks it's cache for recent authenticators by the same user to provide replay protection. A final service authenticator message containing the service ID and timestamp is encrypted with the Service Session Key and sent to the user. The user decrypts the service authenticator, verifies that data and stores a copy of the Service Ticket in it's own cache for future use.

After step 6, the mutual authentication between a user and service is complete and the user is allowed to access the service. An advantage of Kerberos is that at no point in the workflow, credentials are sent across the network. After the authentication, the user and service use the Service Session Key to encrypt all further communication, which is why Kerberos is also referred to as a session-based authentication protocol. 

![Kerberos authentication workflow](/img/kerberos/workflow.png)

## Attack Vectors

Due to its role as the authentication authority in a network, Kerberos is a preferred target for threat actors and adversaries, especially when attacking Windows Active Directory environments. In the following, three of the most common and devastating types of Kerberos exploitation techniques are showcased. 

### Roasting / Credential gathering / Hash gathering

When talking about Roasting in the context of Kerberos, it is differentiated between so-called Kerberoasting[^4] and ASREP-Roasting. **Kerberoasting**, on one hand, aims to exploit accounts that have a Service Principal Name (SPN) configured, which are usually web or database service users. If a user account has a SPN set, an adversary can request a ST to that user and through this obtain the krb5tgs hash of the user. If the password is weak enough, this hash can be easily cracked or brute-forced offline and the attacker compromises the account.

The other variant, **ASREP-Roasting** exploits principals that do not require Kerberos pre-authentication or have pre-authentication disabled. This feature was present in older Kerberos versions and basically enables an attacker to send a fake AS_REQ request to KDC without the users password and obtain the TGT and the message, which is encrypted with the target users secret key. The krb5asrep hash can be extracted from this data and can then be attempted to be cracked using brute-force methodology or a dictionary attack. Kerberos 5 requires a password to be used for the Authentication Server Request, but misconfigurations allow this to be disabled. 

### Ticket Attacks

Ticket attacks are amongst the most popular attack techniques for exploiting Active Directory and Kerberos authentication. It is differentiated between Golden and Silver Ticket attacks. For a **Silver Ticket** attack, a threat actor has compromised the password hash of a service account and is therefore able to forge Service Tickets and access restricted resources for this specific service.

To conduct a **Golden Ticket** attack, an attacker has to obtain the password hash of the krbtgt service account which allows them to forge TGTs, effectively granting unrestricted access to any service and allowing full domain or realm takeover. The krbtgt account works as the KDC to issue Kerberos tickets to clients and it’s password is usually not changed, meaning golden tickets can be used for long-term persistence if the attack is not detected. A high-privileged account, e.g. a Domain Admin or local administrator on the DC is needed to initially compromise the krbtgt hash via credential dumping. 

### Kerberos Delegation Attacks

Kerberos delegation[^5] comes into play, when a service is configured to act in behalf of another principal. Following is an easy example to demonstrate a use-case for delegation. The subjects are a user, a website hosted on a webserver, as well as a SQL database on a different server. When the user authenticates to the webserver, delegation makes it possible that the web service user requests access to the SQL server on behalf of the user, impersonating them instead of authenticating as the service account itself. This allows the user to only access database resources that they are allowed to access. There are three types of Kerberos delegation that can be exploited by threat actors.

When** Unconstrained Delegation** is configured on a host, a TGT for each account authenticating to that host is stored in-memory to allow the host to impersonate that principal later. This is a severe security concern, since tickets can be easily extracted from memory using tools like mimikatz or Rubeus, allowing for the compromise of potentially privileged accounts that connected to that host. In combination with other exploits, it is also possible to force for example the domain controller to authenticate to the host with constrained delegation to obtain the TGT.

On the other hand, **Constrained Delegation** allows the configuration of what services an account can be delegated to, making it less risky than its unconstrained sibling. If a user account or a computer (machine account) that has constrained delegation enabled is compromised, it's possible to impersonate any domain user (including administrator) and authenticate to a service that the user account is trusted to delegate to. Constrained delegation abuses the S4U2self and S4U2proxy protocol extensions (S4U = Service For User), which allow an service to retrieve a TGS for itself on behalf of other users.

Finally, **Resource-based Constrained Delegation (RBCD)** is even more secure than the other two variations, but can still be abused to obtain access to restricted resources. In contrast to unconstrained and constrained delegation where a computer/user object is told what resources it can delegate authentications to, resource-based constrained delegation allows computer objects to specify who they trust and who can delegate to them. RBCD is controlled by the msDS-AllowedToActOnBehalfOfOtherIdentity attribute of an account object. If an attacker can edit this property for example a domain controller, they can essentially create a new computer account in the domain, allow the domain controller to act on behalf of this created account and then exploit the S4Uslef and S4Uproxy with Rubeus like with constrained delegation. 

## Conclusion

Kerberos is a network authentication protocol designed to provide strong authentication for client/server applications. Using secret-key cryptography, it allows a client to prove its identity to a server (and vice versa) across an insecure network connection. Central to the protocol is the Key Distribution Center (KDC), which consists of the Authentication Server (AS) and the Ticket-Granting Server (TGS). Clients first authenticate with the AS to obtain a Ticket-Granting Ticket (TGT), which is then used to request service-specific tickets from the TGS. The protocol ensures both authentication and confidentiality and relies on time-sensitive tickets to prevent replay attacks. Kerberos has become an attractive target for threat actors when targeting Active Directory environments, due to its role as an authentication authority and the quantity of effective attack vectors. 

| *Advantages* | *Disadvantages* | 
|--- | --- |
| Single sign-on is one of the biggest direct benefits of Kerberos, allowing a user to enter their credentials once, and continue to renew their ticket without intervention | Single point of failure: If the KDC is compromised, the whole authentication system is compromised and all passwords can be dumped and extracted |
| Mutual client-server authentication without sending passwords over the insecure network | Only symmetric key cryptography is supported ⇒ key scaling and distribution issues |
| Default authentication mechanism in Windows since Windows 2000 and built into macOS, Red Hat and other Linux distributions | Knowledge based authentication only ⇒ weak passwords lead to easy compromise |
| Both ends of the communication chain must be authenticated | Misconfiguration can lead to tickets being active for a long time |
| If properly configured, tickets are only viable for a limited amount of time | Time-synchronization between KDC and all clients is necessary for the system to function properly |
| The protocol is open source and based on open internet standards | Client-side storage of tickets in memory is unsafe, since tickets can be dumped with tools like mimikatz and reused by other users | 

<!--{{< youtube 5N242XcKAsM >}}
{{< youtube qW361k3-BtU >}}
{{< youtube snGeZlDQL2Q >}}--> 


<!-- Resources -->

[^4]: https://www.crowdstrike.com/cybersecurity-101/kerberoasting/
[^5]: https://blog.netwrix.com/2021/11/30/what-is-kerberos-delegation-an-overview-of-kerberos-delegation/
[^videos]: Must-watch  videos about the topic: 

    https://www.youtube.com/watch?v=5N242XcKAsM

    https://www.youtube.com/watch?v=qW361k3-BtU
    
    https://www.youtube.com/watch?v=snGeZlDQL2Q