# Linux Fundamentals — Exam-First Cheat Notes

Built from the Linux class, Session 2 homework, and your MCQ sheet.

## A. Priority order for revision

1. Navigation, files, paths
2. Permissions and ownership
3. grep, find, pipe, redirection
4. Users and groups
5. Processes, disk and memory
6. systemctl and journalctl
7. SSH, apt and networking
8. Hard and soft links

## B. Navigation and file commands

| Need | Command | Meaning |
|---|---|---|
| Current directory | `pwd` | Prints absolute current path. |
| Change directory | `cd folder` | `cd ..` parent; `cd ~` home. |
| List files | `ls -la` | Long details plus hidden files. |
| Create folder | `mkdir notes` | Use `mkdir -p a/b/c` to create all missing parent directories (`a` and `b`) along with the final directory (`c`). |
| Empty file | `touch file.txt` | Creates file or updates timestamp. |
| Copy | `cp source target` | `cp -r` copies a directory. |
| Move or rename | `mv old new` | Same command does both. |
| Remove file | `rm file` | No recycle bin. |
| Remove directory | `rm -r folder` | `rm -rf` is forceful: use carefully. |
| Read file | `cat file` / `less file` | `less` is better for large files; q exits. |

### Path symbols

- `/` = filesystem root.
- `~` = current user's home directory.
- `.` = current directory; `..` = parent directory.
- Absolute path begins with `/`, e.g. `/var/log/syslog`.
- Relative path begins from the current directory, e.g. `logs/app.log`.
- MCQ trap: `/` is filesystem root; `/root` is root user's home folder.

## C. Important Linux directories

| Directory | Main purpose |
|---|---|
| `/etc` | System/application configuration. |
| `/var/log` | Log files; first place to investigate errors. |
| `/home` | Normal user home directories. |
| `/root` | Root user's home directory. |
| `/tmp` | Temporary files. |
| `/usr/bin` | Many command/program binaries. |
| `/opt` | Optional third-party software. |
| `/proc` | Virtual process/kernel information. |

High-yield answer: Linux logs are usually in `/var/log`; configuration is usually in `/etc`.

## D. Text, pipe and redirection

| Item | Meaning | Example |
|---|---|---|
| `>` | Write output and overwrite old contents | `echo hello > file.txt` |
| `>>` | Append output | `echo hello >> file.txt` |
| `2>` | Redirect errors | `command 2> errors.txt` |
| `2>&1` | Combine error output with normal output | `command > all.log 2>&1` |
| `|` | Send left command output to right command | `ps aux | grep nginx` |

- `grep` searches file **content**; `find` searches file/directory **names**.
- `grep` is case-sensitive by default. `grep -i` ignores case.

```bash
grep -in error app.log       # case-insensitive + line numbers
grep -r TODO .               # recursive text search
grep -v health app.log       # lines not matching
find /etc -name "*.conf"
find . -type f -name "README.md"
```

MCQ trap: `>` overwrites; `>>` appends.

## E. Permissions and ownership

### Permission calculator

- `r = 4`, `w = 2`, `x = 1`.
- `7 = rwx`; `6 = rw-`; `5 = r-x`; `4 = r--`; `0 = ---`.
- Three digits mean: owner, group, others.

```bash
chmod 644 file.txt       # normal file: rw-r--r--
chmod 755 script.sh      # script/directory: rwxr-xr-x
chmod 600 private.env    # only owner read/write
chmod 400 server.pem     # only owner read: SSH key pattern
chmod +x deploy.sh       # add executable permission
chown kaif file.txt
chown kaif:developers file.txt
chgrp developers file.txt
chown -R kaif:developers project/
ls -l file.txt
```

| Command | Changes |
|---|---|
| `chmod` | permissions |
| `chown` | owner, and optionally group |
| `chgrp` | group only |

Common MCQ patterns:

- `644`: standard file.
- `755`: executable script or directory.
- `600`: private secret/config.
- `400`: private PEM SSH key.
- `777`: everyone has all access; usually insecure.

`ls -l` starts with `-` for regular file, `d` for directory, `l` for symbolic link.

Example: `-rwxr-xr--` is owner 7, group 5, others 4 = **754**.

- `-R` means recursively apply through nested directories.
- `*` is a shell wildcard matching names in the current directory.
- They are not interchangeable.

## F. Users and groups

| File | Purpose |
|---|---|
| `/etc/passwd` | User data: name, UID, primary GID, home, login shell. |
| `/etc/group` | Group definitions and members. |

```bash
whoami
w
id kaif
sudo adduser student
sudo useradd -m -s /bin/bash student
sudo passwd student
sudo usermod -aG docker student
sudo deluser --remove-home student
```

- `adduser`: friendly interactive Ubuntu/Debian command; usually creates home and asks for password.
- `useradd`: lower-level, useful in scripts; use `-m` to create home.
- `usermod`: changes an existing user; `-aG` appends a supplementary group.

## G. Processes, disk and memory

```bash
ps aux
ps aux | grep nginx
top
htop
kill PID                 # graceful SIGTERM (15)
kill -9 PID              # force kill: last resort
pkill nginx
df -h
du -sh folder/
free -h
uptime
ps aux --sort=-%mem | head
ps aux --sort=-%cpu | head
```

- `df -h`: free disk/filesystem space.
- `du -sh folder/`: directory size used.
- `free -h`: RAM and swap.
- Try `kill` or `kill -15` before `kill -9`; SIGKILL gives no cleanup chance.

Quick slow-system sequence:

```bash
uptime
free -h
df -h
ps aux --sort=-%mem | head
ps aux --sort=-%cpu | head
```

## H. Services and logs

```bash
sudo systemctl status nginx
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl enable nginx

journalctl -n 20
journalctl -u nginx -n 50 --no-pager
journalctl -u nginx -f
journalctl --since today
journalctl -p err
journalctl -b
journalctl -b -1
```

- `start`: start service now.
- `restart`: stop and start again.
- `reload`: reread supported configuration without full restart.
- `enable`: automatically start at boot.
- `journalctl`: reads systemd journal; it is not simply a normal `/var/log` file.

Service failure debug sequence:

```bash
sudo systemctl status nginx
journalctl -u nginx -n 50 --no-pager
sudo ss -tulpn
curl -I http://localhost
```

Memorise: **status → logs → listening port → local HTTP test**.

## I. SSH, apt and networking

```bash
chmod 400 server.pem
ssh -i server.pem ubuntu@SERVER_IP
sudo apt update
sudo apt upgrade -y
sudo apt install nginx
ip a
ss -tulpn
ping example.com
curl -I http://localhost
wget URL
```

MCQ fact: an SSH PEM key commonly needs `chmod 400 key.pem`, otherwise SSH rejects unsafe permissions.

## J. Hard link vs symbolic link

| Feature | Hard link | Symbolic/soft link |
|---|---|---|
| Command | `ln original hardlink` | `ln -s original symlink` |
| Inode | Same as original | Different inode; stores path |
| Original deleted | Still accesses data | Becomes broken |
| Cross filesystem | No | Yes |
| Directories | Generally no | Yes |

MCQ trap: a symbolic link is a reference/path, not another real copy of a file.

## K. Most likely MCQ answers

| Question asks | Answer |
|---|---|
| Current directory? | `pwd` |
| Hidden files? | `ls -a` |
| Permissions? | `chmod` |
| Ownership? | `chown` |
| Case-insensitive grep? | `grep -i` |
| Search text? | `grep` |
| Search filename? | `find` |
| Append output? | `>>` |
| Pipe output? | `|` |
| Config files? | `/etc` |
| Log files? | `/var/log` |
| Disk space? | `df -h` |
| Memory? | `free -h` |
| Process list? | `ps aux` |
| Service controller? | `systemctl` |
| systemd logs? | `journalctl` |
| Recursive option? | `-R` |
| Force kill? | `kill -9 PID` |

## L. Five quick practice prompts

1. Give owner full permission, group read/execute, others read: `chmod 754 file`.
2. Find `.conf` files below `/etc`: `find /etc -name "*.conf"`.
3. Search ERROR/error with line numbers: `grep -in error app.log`.
4. Read last 30 Docker service entries: `journalctl -u docker -n 30 --no-pager`.
5. Start nginx at every boot: `sudo systemctl enable nginx`.

## One-minute memory list

```text
pwd, cd, ls -la
mkdir, touch, cp, mv, rm -r
grep content; find names; > overwrite; >> append; | pipe
chmod permissions; chown owner; r=4 w=2 x=1
644 normal file; 755 script/dir; 400 SSH key
/etc config; /var/log logs; /home users; /tmp temporary
ps/top processes; df disk; free memory
systemctl services; journalctl logs
adduser/useradd/usermod; /etc/passwd; /etc/group
ln hard link; ln -s symbolic link
```
