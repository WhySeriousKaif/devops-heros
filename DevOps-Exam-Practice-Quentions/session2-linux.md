# MCQs — session2-linux

**10 multiple-choice questions | 1 mark each | Answer key at the end**

### Q1. Which command prints the working directory?

A. mv
B. ls
C. cd
D. pwd

### Q2. Which command lists files including hidden files?

A. pwd -a
B. rm -a
C. ls -a
D. mkdir -a

### Q3. What does chmod change?

A. File permissions
B. Hostname
C. File ownership only
D. Network interface

### Q4. Which command searches text in files?

A. pwd
B. touch
C. mv
D. grep

### Q5. Which command displays a file's contents?

A. kill
B. rmdir
C. mkdir
D. cat

### Q6. What does the pipe operator do?

A. Redirects all input to a file
B. Runs commands only as root
C. Deletes temporary files
D. Passes one command's output to another

### Q7. Which command shows running processes?

A. cp
B. ls
C. ps
D. mkdir

### Q8. Which command changes the current directory?

A. cd
B. echo
C. pwd
D. cat

### Q9. What does sudo typically allow?

A. Run commands with elevated privileges
B. Download a container image
C. Create a symbolic link
D. Show DNS records

### Q10. Which command displays disk space usage by filesystem?

A. du -a
B. uname -a
C. free -m
D. df -h

---

## Answer Key

1-D, 2-C, 3-A, 4-D, 5-D, 6-D, 7-C, 8-A, 9-A, 10-D

---

## Practical / Lab Questions (Exam Style)

**Suggested format:** Complete the task in the relevant lab environment, submit commands/configuration files, and include brief evidence of verification. Do not hard-code credentials.

### Lab 1
Create a project directory with app, logs, and config subdirectories. Create sample files and demonstrate listing, copying, moving, searching, and deleting files.

### Lab 2
Create a user named examuser and a group named devops. Add the user to the group and configure suitable ownership and permissions on a project directory.

### Lab 3
Check the status of a Linux service, inspect its logs, and document the commands used to diagnose a simulated service problem.


---

## Kaif’s revision help — why the answers are correct

| Question | Correct answer | Why |
|---|---|---|
| Q1 | D | `pwd` prints the present working directory. |
| Q2 | C | `ls -a` includes hidden names beginning with a dot. |
| Q3 | A | `chmod` changes read/write/execute permissions. |
| Q4 | D | `grep` searches for text inside files. |
| Q5 | D | `cat` prints a file’s content to the terminal. |
| Q6 | D | `|` sends standard output of one command to the next command. |
| Q7 | C | `ps` displays processes; `ps aux` is a common full listing. |
| Q8 | A | `cd` changes the current directory. |
| Q9 | A | `sudo` runs an allowed command with elevated privileges. |
| Q10 | D | `df -h` shows filesystem free/used disk space in readable units. |

### Practical-lab answer approach

```bash
mkdir -p exam-project/{app,logs,config}  # create nested project folders
touch exam-project/app/main.py           # create sample app file
echo "ERROR example" > exam-project/logs/app.log
cp exam-project/app/main.py exam-project/app/main-copy.py
mv exam-project/app/main-copy.py exam-project/app/backup.py
grep -in "error" exam-project/logs/app.log  # search content, case-insensitive
```

For user/group task:

```bash
sudo groupadd devops
sudo useradd -m examuser
sudo usermod -aG devops examuser
sudo chown -R examuser:devops exam-project
sudo chmod -R 750 exam-project
```

For service diagnosis:

```bash
sudo systemctl status nginx
journalctl -u nginx -n 50 --no-pager
sudo ss -tulpn
```

Remember: `chmod` = permissions; `chown` = ownership; `chgrp` = group only.
