# MCQs — session3-shell-scripting

**10 multiple-choice questions | 1 mark each | Answer key at the end**

### Q1. Which line commonly selects Bash as script interpreter?

A. #bash/start
B. //bin/bash
C. #!/bin/bash
D. #!/usr/git

### Q2. How do you reference the first positional argument in Bash?

A. $0
B. $#
C. $?
D. $1

### Q3. Which operator tests whether a regular file exists in Bash?

A. [ -p file ]
B. [ -d file ]
C. [ -f file ]
D. [ -z file ]

### Q4. What does $? contain immediately after a command?

A. Exit status of the previous command
B. Current username
C. Number of script lines
D. Current process ID

### Q5. Which loop iterates over a sequence of values?

A. exit
B. for
C. case
D. if

### Q6. How do you make a script executable?

A. grep +x script.sh
B. pwd script.sh
C. chmod +x script.sh
D. cat +x script.sh

### Q7. Which construct makes a conditional decision?

A. for ... done
B. echo ... print
C. if ... then ... fi
D. read ... exit

### Q8. How do you assign a variable in Bash?

A. $NAME=value
B. NAME=value
C. set NAME := value
D. NAME = value

### Q9. Which command reads input from the terminal?

A. touch
B. echo
C. printf
D. read

### Q10. What does && mean between two commands?

A. Run the second only if first fails
B. Run the second only if the first succeeds
C. Always run both in parallel
D. Append output to a file

---

## Answer Key

1-C, 2-D, 3-C, 4-A, 5-B, 6-C, 7-C, 8-B, 9-D, 10-B

---

## Practical / Lab Questions (Exam Style)

**Suggested format:** Complete the task in the relevant lab environment, submit commands/configuration files, and include brief evidence of verification. Do not hard-code credentials.

### Lab 1
Write a shell script that accepts a directory path as an argument and displays the number of files and subdirectories. Handle a missing or invalid argument.

### Lab 2
Write a script that checks whether a supplied file exists and is readable, writable, and executable. Print a clear result for each check.

### Lab 3
Write a reusable system-health script using variables, conditions, loops, and functions. Report disk usage, memory, and uptime.


---

## Kaif’s revision help — why the answers are correct

| Question | Correct answer | Why |
|---|---|---|
| Q1 | C | `#!/bin/bash` is a shebang selecting the Bash interpreter. |
| Q2 | D | `$1` is the first positional argument; `$0` is script name. |
| Q3 | C | `[ -f file ]` tests whether a regular file exists. |
| Q4 | A | `$?` stores the exit status of the immediately previous command; 0 usually means success. |
| Q5 | B | A `for` loop iterates through known items/ranges. |
| Q6 | C | `chmod +x script.sh` adds execute permission. |
| Q7 | C | `if ... then ... fi` is Bash’s conditional structure. |
| Q8 | B | Variable assignment has no spaces: `NAME=value`. |
| Q9 | D | `read` accepts terminal input; `read -p` also displays a prompt. |
| Q10 | B | `&&` runs the right command only after the left command succeeds. |

### Practical-lab answer approach

Count files and directories safely:

```bash
#!/bin/bash
dir="$1"
if [ -z "$dir" ] || [ ! -d "$dir" ]; then
  echo "Usage: $0 <valid-directory>"
  exit 1
fi
echo "Files: $(find "$dir" -maxdepth 1 -type f | wc -l)"
echo "Directories: $(find "$dir" -maxdepth 1 -type d | wc -l)"
```

File-permission checks use `-e`, `-r`, `-w`, and `-x`. For system health, use `df -h`, `free -h`, and `uptime` inside a function. Review the Session 3 notes for each test operator.
