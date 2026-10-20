# MCQs — session4-networking

**10 multiple-choice questions | 1 mark each | Answer key at the end**

### Q1. What does DNS primarily do?

A. Resolve names to IP addresses
B. Build application binaries
C. Schedule containers
D. Encrypt disk volumes

### Q2. What does an IP address identify?

A. A Docker image tag
B. A CPU instruction
C. A network interface on an IP network
D. A Git repository

### Q3. Which protocol provides reliable ordered delivery?

A. ICMP
B. ARP
C. TCP
D. UDP

### Q4. Which command can test basic ICMP reachability?

A. ping
B. git status
C. chmod
D. docker build

### Q5. What does HTTP status 404 mean?

A. Authentication succeeded
B. Resource not found
C. Successful request
D. Server started

### Q6. What is the usual default port for HTTPS?

A. 22
B. 53
C. 443
D. 80

### Q7. Which tool can make HTTP requests from a terminal?

A. tar
B. mkdir
C. grep
D. curl

### Q8. What does a subnet mask/prefix indicate?

A. A Docker volume size
B. A password length
C. The network portion of an IP address
D. A DNS TTL only

### Q9. What is the role of a default gateway?

A. Forward traffic to other networks
B. Compile Java programs
C. Start systemd services
D. Resolve Git merge conflicts

### Q10. Which protocol is commonly used for secure remote shell access?

A. DHCP
B. FTP
C. SSH
D. SMTP

---

## Answer Key

1-A, 2-C, 3-C, 4-A, 5-B, 6-C, 7-D, 8-C, 9-A, 10-C

---

## Practical / Lab Questions (Exam Style)

**Suggested format:** Complete the task in the relevant lab environment, submit commands/configuration files, and include brief evidence of verification. Do not hard-code credentials.

### Lab 1
Use Linux commands to display the machine IP address, subnet information, default route, and listening ports. Include the command and a brief interpretation for each.

### Lab 2
Use ping, ss, and curl to troubleshoot a web service. Determine whether a simulated failure is caused by reachability, a closed port, or an HTTP response.

### Lab 3
Resolve a domain using nslookup or dig, then use curl to verify HTTP/HTTPS connectivity. Record the DNS result and HTTP status.


---

## Kaif’s revision help — why the answers are correct

| Question | Correct answer | Why |
|---|---|---|
| Q1 | A | DNS translates names such as `example.com` into IP addresses. |
| Q2 | C | An IP address identifies a network interface for IP routing. |
| Q3 | C | TCP provides reliable, ordered, connection-oriented delivery. |
| Q4 | A | `ping` uses ICMP echo messages for basic reachability testing. |
| Q5 | B | HTTP 404 means the requested resource was not found. |
| Q6 | C | HTTPS normally uses TCP port 443. |
| Q7 | D | `curl` makes HTTP requests from the terminal. |
| Q8 | C | A subnet mask/CIDR prefix separates network bits from host bits. |
| Q9 | A | A default gateway forwards traffic to destinations outside the local network. |
| Q10 | C | SSH is secure remote shell access and normally uses TCP port 22. |

### Practical-lab answer approach

```bash
ip a                           # interfaces and IP addresses
ip route                       # default gateway and routing table
sudo ss -tulpn                 # listening TCP/UDP ports and processes
ping -c 4 8.8.8.8              # basic IP reachability
nslookup example.com           # DNS resolution
curl -I https://example.com    # HTTP status and headers
```

Troubleshoot in this order: IP address → default route → reach a public IP → DNS → listening port → HTTP response. If an IP works but a domain fails, suspect DNS. If local curl works but external access fails, suspect port mapping/firewall/security group.
