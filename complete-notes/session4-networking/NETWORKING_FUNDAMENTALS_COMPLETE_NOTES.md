# Networking Fundamentals — Complete Beginner Notes

These are learning notes for Session 4, based on the class transcript, the completed homework, and class resources. Read from top to bottom once; then use the practice questions at the end.

## 1. What networking means

Networking is how computers, phones, servers, applications, and cloud services communicate. A network needs a way to identify devices, decide where data should travel, and decide which application should receive the data.

Think of sending a parcel:

- An **IP address** is the building address.
- A **port** is the apartment or department inside that building.
- A **protocol** is the agreed delivery rule.
- A **router/default gateway** is the next road junction.
- **DNS** is the phone book that converts a name such as `google.com` into an IP address.

In DevOps, networking matters whenever a server is unreachable, a website does not open, DNS fails, a port is blocked, a container cannot reach a database, or an AWS security group needs a rule.

---

## 2. The basic journey of opening a website

When you open `https://example.com`:

1. Your computer checks whether it already knows the name (cache or `/etc/hosts`).
2. If not, it asks **DNS** for the IP address of `example.com`.
3. Your computer sends traffic to its **default gateway** (normally your router) if the destination is outside its local network.
4. Routers forward packets toward the destination IP address.
5. The browser connects to the website's **port**—normally 443 for HTTPS.
6. HTTPS uses TLS to set up an encrypted connection.
7. The web server returns an HTTP response such as `200 OK`.

This one flow connects most of the concepts in this session.

---

## 3. IP addresses

An **IP address** is a logical address used to identify a device or network interface on an IP network. It is not the same as a MAC address.

### IPv4

IPv4 has **32 bits**, written as four decimal groups (octets), for example:

```text
192.168.1.25
```

Each octet ranges from 0 to 255 because it represents 8 binary bits.

### IPv6

IPv6 has **128 bits** and was created because IPv4 addresses are limited. Example:

```text
2001:db8:85a3::8a2e:370:7334
```

For this exam level, remember: IPv4 = 32 bits; IPv6 = 128 bits.

### Private and public IP addresses

A **private IP** is used inside a local network, VPC, office, or home network. It is not routed directly on the public internet.

| Private range | CIDR block |
|---|---|
| `10.0.0.0` to `10.255.255.255` | `10.0.0.0/8` |
| `172.16.0.0` to `172.31.255.255` | `172.16.0.0/12` |
| `192.168.0.0` to `192.168.255.255` | `192.168.0.0/16` |

A **public IP** is globally routable on the internet. Cloud load balancers, public EC2 instances, and websites can use public addresses.

### Special addresses

| Address / range | Meaning |
|---|---|
| `127.0.0.1` | Loopback: this computer itself; also called `localhost`. |
| `0.0.0.0/0` | Every IPv4 address; used in firewall/security-group rules to mean anywhere. |
| `0.0.0.0` | Unspecified/default address in some contexts; not a normal host address. |
| `255.255.255.255` | IPv4 limited broadcast address. |

**AWS safety note:** allowing `0.0.0.0/0` means anyone on the internet can attempt to reach that port. It can be acceptable for public HTTP/HTTPS, but is risky for SSH or databases.

---

## 4. Network address, host address, broadcast address

An IP address has two logical parts:

- **Network part**: which network the device belongs to.
- **Host part**: which device inside that network.

A **subnet mask** or **CIDR prefix** tells us where the network part ends and host part starts.

Example: `192.168.1.25/24`

- `/24` means the first 24 bits identify the network.
- The equivalent mask is `255.255.255.0`.
- Network address: `192.168.1.0`.
- Broadcast address: `192.168.1.255`.
- Usable host range: `192.168.1.1` to `192.168.1.254`.

The network address identifies the network, and the broadcast address sends to all hosts in an IPv4 subnet. They are normally not assigned to ordinary devices.

---

## 5. CIDR and subnetting

**CIDR** means Classless Inter-Domain Routing. The `/number` after an address is the number of network bits.

```text
192.168.1.0/24
           ^^
           24 network bits, 8 host bits
```

### Main formula

```text
Host bits = 32 - prefix length
Total addresses = 2^(host bits)
Usable IPv4 host addresses = 2^(host bits) - 2
```

The minus 2 is for the network address and broadcast address in a normal IPv4 subnet. In AWS, remember that AWS reserves additional addresses in each subnet, but standard exam questions usually use the formula above unless AWS-specific wording says otherwise.

### Common CIDR values

| CIDR | Mask | Host bits | Usable IPv4 hosts | Typical meaning |
|---|---|---:|---:|---|
| `/8` | `255.0.0.0` | 24 | 16,777,214 | Very large network |
| `/16` | `255.255.0.0` | 16 | 65,534 | Medium/large network |
| `/24` | `255.255.255.0` | 8 | 254 | Common small subnet |
| `/25` | `255.255.255.128` | 7 | 126 | Half of a /24 |
| `/26` | `255.255.255.192` | 6 | 62 | Quarter of a /24 |
| `/27` | `255.255.255.224` | 5 | 30 | Small subnet |
| `/28` | `255.255.255.240` | 4 | 14 | Very small subnet |
| `/30` | `255.255.255.252` | 2 | 2 | Often point-to-point link |

+### Extra CIDR values and edge cases

| CIDR | Mask | Block size in final changing octet | Usable hosts |
|---|---|---:|---:|
| `/29` | `255.255.255.248` | 8 | 6 |
| `/30` | `255.255.255.252` | 4 | 2 |
| `/31` | `255.255.255.254` | 2 | Special point-to-point case |
| `/32` | `255.255.255.255` | 1 | One exact address |

`/31` is commonly used on point-to-point links and `/32` identifies one exact host/address, so do not blindly apply the normal usable-host formula to them.

### Fast subnetting method: block size

For common `/24`-based subnetting questions, use:

```text
Block size = 256 − the changing subnet-mask octet
```

**Example: Find the subnet details for `192.168.1.100/26`.**

1. `/26` = `255.255.255.192`.
2. Changing octet = 192, so block size = `256 − 192 = 64`.
3. The fourth-octet blocks are `0–63`, `64–127`, `128–191`, and `192–255`.
4. `100` lies in the `64–127` block.
5. Network address = **`192.168.1.64`**.
6. Broadcast address = **`192.168.1.127`**.
7. Usable range = **`192.168.1.65` to `192.168.1.126`**.

Memory rule: the first address is the network address, the last is the broadcast address, and usable hosts lie in between.

### Binary values worth memorising

Each IPv4 octet has these bit positions:

```text
128  64  32  16  8  4  2  1
```

| Binary mask octet | Decimal | Common prefix ending |
|---|---:|---|
| `10000000` | 128 | `/25` |
| `11000000` | 192 | `/26` |
| `11100000` | 224 | `/27` |
| `11110000` | 240 | `/28` |
| `11111000` | 248 | `/29` |
| `11111100` | 252 | `/30` |

### One important rule about classes

If an address has an explicit CIDR prefix, always use that prefix. For example, `192.168.1.0/26` is a `/26`, even though `192.x.x.x` historically belongs to Class C with a default `/24` mask.

Class E (`240–255` in the first octet) is reserved/experimental. It is not normal unicast host addressing.

### Worked examples

**Question:** What is the highest usable host address in `192.168.0.0/24`?

- `/24` gives mask `255.255.255.0`.
- Network address = `192.168.0.0`.
- Broadcast = `192.168.0.255`.
- Highest usable = **`192.168.0.254`**.

**Question:** `255.255.252.0` has how many host bits?

- `255` = 8 network bits.
- next `255` = 8 network bits.
- `252` in binary is `11111100` = 6 network bits.
- final `0` = 0 network bits.
- Total prefix = `/22`; host bits = `32 - 22 = 10`.
- Usable hosts = `2^10 - 2 = 1022`.

### Legacy IP classes

Classful addressing is an older way of describing IPv4 ranges. Modern networking uses CIDR, but classes can appear in beginner MCQs.

| Class | First octet | Historical default mask |
|---|---:|---|
| A | 1–126 | `/8` or `255.0.0.0` |
| B | 128–191 | `/16` or `255.255.0.0` |
| C | 192–223 | `/24` or `255.255.255.0` |
| D | 224–239 | Multicast, not ordinary hosts |

`127.x.x.x` is reserved for loopback, so do not treat it as normal Class A host space.

---

## 6. MAC address versus IP address

- A **MAC address** identifies a network interface at the local network/data-link level. Example: `00:1A:2B:3C:4D:5E`.
- An **IP address** identifies a device/interface for routing across networks.
- IP addresses can change—for example, after DHCP assigns a new address. MAC addresses are normally tied to the network adapter, although they can be changed/spoofed.

Simple memory trick: MAC is local hardware identity; IP is the routable network address.

---

## 7. DNS and `/etc/hosts`

**DNS (Domain Name System)** converts a human-friendly name into an IP address.

```text
google.com  →  one or more IP addresses
```

### Useful commands

```bash
cat /etc/hosts
nslookup google.com
dig google.com
dig google.com +short
```

- `/etc/hosts` is a local file containing static name-to-IP mappings.
- Operating systems normally consult local host mappings before external DNS lookup.
- `nslookup` gives a basic DNS lookup.
- `dig` gives more DNS detail such as records, query time, and TTL.

Example local mapping:

```text
127.0.0.1 localhost
192.168.1.50 internal-app.local
```

### DNS troubleshooting idea

If `ping 8.8.8.8` works but `ping google.com` fails, internet IP connectivity likely works but DNS resolution is failing.

---

## 8. DHCP

**DHCP (Dynamic Host Configuration Protocol)** automatically gives a device its network settings, commonly:

- IP address
- subnet mask/prefix
- default gateway
- DNS server address

Without DHCP, an administrator would need to configure every device manually. In a home network, the router often acts as DHCP server; in cloud networking, DHCP options help instances receive configuration.

Exam answer: DHCP automatically assigns IP configuration to clients.

---

## 9. Default gateway and routing

A **default gateway** is the router your device sends traffic to when the destination is outside your local subnet.

Example:

```text
Your laptop:       192.168.1.25/24
Your local network: 192.168.1.0/24
Gateway/router:    192.168.1.1
Website:           142.x.x.x
```

The website is outside `192.168.1.0/24`, so your laptop sends the packet first to `192.168.1.1`.

```bash
ip route          # preferred Linux command
netstat -nr       # older/common alternative
```

Look for a line beginning with `default`; it identifies the default route/gateway.

### NAT

**NAT (Network Address Translation)** translates addresses. A common example is a home router translating many private addresses such as `192.168.1.x` into one public internet address. This is why private IPs can access the internet without being directly reachable from it.

---

## 10. Protocols: TCP, UDP, ICMP

A **protocol** is a set of rules for how network communication happens.

### TCP

**TCP (Transmission Control Protocol)** is connection-oriented and reliable.

- It establishes a connection before transferring application data.
- It uses acknowledgements, ordering, and retransmission to make delivery reliable.
- It is used by HTTP/HTTPS, SSH, database connections, and many web applications.

### UDP

**UDP (User Datagram Protocol)** is connectionless and has less overhead.

- It does not guarantee delivery, order, or retransmission.
- It is often used where speed and low latency matter, such as DNS queries, streaming, voice/video, and gaming.

### ICMP

**ICMP (Internet Control Message Protocol)** carries network-control and diagnostic messages. The `ping` command uses ICMP Echo Request and Echo Reply messages.

Important correction: TCP and UDP do not decide whether packets use the same physical route. Routers choose paths using IP routing; network routes can change for either protocol.

---

## 11. Ports and common services

A port identifies the application/service on a host. The IP gets traffic to the server; the port gets it to the correct application.

| Service | Default port | Protocol |
|---|---:|---|
| HTTP | 80 | TCP |
| HTTPS | 443 | TCP |
| SSH | 22 | TCP |
| DNS | 53 | UDP and TCP |
| SMTP email | 25 | TCP |
| MySQL | 3306 | TCP |
| PostgreSQL | 5432 | TCP |
| Common development application | 8080 | Usually TCP |

Example: `https://example.com` normally means connect to example.com's IP at TCP port 443.

### Check listening ports

```bash
ss -tuln
sudo ss -tulpn
netstat -tuln
```

Flags:

- `-t` TCP
- `-u` UDP
- `-l` listening sockets only
- `-n` numeric addresses/ports
- `-p` process using the socket (usually needs sudo)

If an app should run on port 8000 but `ss -tulpn` does not show 8000, the service may not be running or may be bound incorrectly.

---

## 12. HTTP and HTTPS

### HTTP

**HTTP** is the web application protocol. It defines requests and responses such as `GET`, `POST`, and response codes.

Common response codes:

| Code | Meaning |
|---:|---|
| 200 | Success: OK |
| 301 / 302 | Redirect |
| 401 | Authentication required |
| 403 | Forbidden |
| 404 | Resource not found |
| 500 | Server-side application error |

### HTTPS

**HTTPS** is HTTP protected with TLS encryption.

- TLS encrypts data between the client and server.
- A TLS certificate helps the client verify the server identity.
- HTTPS normally uses port 443.

Use `curl -I` to send an HTTP HEAD request and inspect response headers without downloading the whole page:

```bash
curl -I https://example.com
curl -I http://localhost:8000
```

A `200 OK` shows that the web server responded successfully. A redirect such as `301` may still indicate that the web server is working.

---

## 13. Core networking commands

| Command | What it checks | Example |
|---|---|---|
| `ip a` / `ip addr` | Interfaces, IP addresses, state | `ip a` |
| `ifconfig` | Older/macOS interface view | `ifconfig` |
| `cat /etc/hosts` | Local hostname mappings | `cat /etc/hosts` |
| `nslookup` | Basic DNS result | `nslookup google.com` |
| `dig` | Detailed DNS response | `dig google.com +short` |
| `ping` | IP reachability, loss, latency | `ping -c 4 8.8.8.8` |
| `ip route` | Routing table/default gateway | `ip route` |
| `ss -tulpn` | Listening ports/processes | `sudo ss -tulpn` |
| `curl -I` | HTTP response headers/status | `curl -I https://example.com` |
| `traceroute` | Intermediate router hops | `traceroute google.com` |
| `telnet host port` | Simple TCP port-connect test | `telnet example.com 80` |

### `ping` output

```bash
ping -c 4 google.com
```

- `-c 4` sends exactly four packets.
- Look at packet loss and average round-trip time.
- Ping failure does not always prove a server is down: some firewalls block ICMP deliberately.

### `traceroute`

`traceroute` displays intermediate hops/routers along the path to a destination. It can help identify where a route is slow or stops responding. `* * *` can mean a router does not respond to traceroute probes; it does not always mean total failure.

### `telnet`

`telnet host port` can test basic TCP connectivity to a specific service port. It is a diagnostic tool here—not a secure login method. Modern alternatives include `nc -vz host port`.

---

## 14. A practical troubleshooting flow

When a website or server is unreachable, do not guess. Check one layer at a time:

```text
1. Does this machine have an IP?              ip a
2. Is there a default route/gateway?          ip route
3. Can it reach the local gateway?            ping -c 4 GATEWAY_IP
4. Can it reach a public IP?                  ping -c 4 8.8.8.8
5. Does DNS resolve the hostname?             nslookup DOMAIN
6. Is the target service listening?           sudo ss -tulpn
7. Can the app respond locally over HTTP?     curl -I http://localhost:PORT
8. Is a firewall/security group blocking it?  inspect rules
```

### Example diagnosis

Problem: `https://myapp.example.com` does not open.

- If `nslookup myapp.example.com` fails, fix DNS first.
- If DNS works but `curl -I https://myapp.example.com` times out, inspect routing/firewall/security group/load balancer.
- If public access fails but `curl -I http://localhost:8000` on the server works, the application works locally; investigate port exposure, reverse proxy, firewall, or cloud security rules.
- If local curl gives `500`, the network path is fine; investigate the application logs/code.

---

## 15. OSI model: only what you need

The OSI model divides networking into layers. For beginner DevOps questions, know the rough mapping instead of memorising every detail.

| Layer | Name | Beginner examples |
|---:|---|---|
| 7 | Application | HTTP, HTTPS, DNS, SMTP |
| 4 | Transport | TCP, UDP, ports |
| 3 | Network | IP addresses, routing, routers |
| 2 | Data Link | MAC addresses, switches |
| 1 | Physical | Cable, Wi-Fi radio, signals |

Easy mapping: application problem → HTTP/DNS; transport problem → TCP/UDP/port; network problem → IP/route; local LAN problem → MAC/switch.

---

## 16. Exam-style questions with answers

### Q1. What is an IP address?

**Answer:** A logical network address used to identify and route traffic to a device or network interface. IPv4 has 32 bits; IPv6 has 128 bits.

### Q2. What is the difference between a public and private IP?

**Answer:** A public IP is globally routable on the internet. A private IP is used within private networks/VPCs and requires NAT or another gateway to access the internet.

### Q3. What does `/24` mean in `192.168.1.0/24`?

**Answer:** The first 24 bits are network bits, leaving 8 host bits. The mask is `255.255.255.0`; there are 254 usable IPv4 host addresses.

### Q4. What is the highest usable address in `192.168.10.0/24`?

**Answer:** `192.168.10.254`. `.0` is the network address and `.255` is broadcast.

### Q5. How many usable hosts are in a `/26` subnet?

**Answer:** `/26` leaves 6 host bits. `2^6 - 2 = 62` usable IPv4 hosts.

### Q6. Which command checks a Linux machine's IP addresses?

**Answer:** `ip a` or `ip addr`. `ifconfig` may also be available on macOS/older systems.

### Q7. What does DNS do?

**Answer:** DNS translates domain names, such as `google.com`, into IP addresses.

### Q8. If `ping 8.8.8.8` works but `nslookup google.com` fails, what is likely wrong?

**Answer:** DNS resolution/configuration, not basic IP internet connectivity.

### Q9. What is DHCP?

**Answer:** DHCP automatically assigns a client its IP address, subnet settings, gateway, and often DNS server.

### Q10. TCP versus UDP?

**Answer:** TCP is connection-oriented and reliable with acknowledgements/order; UDP is connectionless and lower overhead, without delivery/order guarantees.

### Q11. What is the default port for HTTPS and SSH?

**Answer:** HTTPS = 443/TCP; SSH = 22/TCP.

### Q12. What does `ss -tulpn` show?

**Answer:** Listening TCP/UDP sockets with numeric ports; `-p` also shows the related process when permitted.

### Q13. What is the role of a default gateway?

**Answer:** It is the router that receives traffic destined outside the local subnet.

### Q14. What does `curl -I` prove?

**Answer:** It requests HTTP response headers and shows whether a web server responds, including status codes and redirects.

### Q15. What does `0.0.0.0/0` mean in an AWS security group?

**Answer:** All IPv4 source addresses—traffic from anywhere on the internet. It should be used carefully.

### Q16. What is a loopback address?

**Answer:** `127.0.0.1`/`localhost`; it sends traffic back to the same machine for local testing.

---

## 17. Final memory map

```text
IP = address of a device/interface
Port = application door on that IP
DNS = name to IP
DHCP = automatic IP settings
Gateway = next router for outside network
Route = path rule for packets
NAT = private-to-public address translation
TCP = reliable; UDP = faster/lower overhead
HTTP = web protocol; HTTPS = HTTP + TLS encryption
ip a = IP/interfaces; ip route = gateway/routes
ping = reachability; nslookup/dig = DNS
ss = listening ports; curl -I = HTTP response
CIDR /24 = 24 network bits, 8 host bits, 254 usable hosts
```
