# Shell Scripting — Exam-First Cheat Notes

Built from the Session 3 class transcript, class scripts, homework, and your supplied cheat sheet.

## 1. What shell scripting is

Shell scripting puts Linux commands plus programming logic into a reusable `.sh` file. In DevOps it is commonly used to collect logs, check health, create files/directories, run repeated tasks, and automate simple server work.

**Class workflow:** break one large task into small commands, test each command in the terminal, then assemble the working commands into a script.

## 2. Create and run a script

```bash
touch system_info.sh
chmod +x system_info.sh
./system_info.sh
# Alternative execution:
bash system_info.sh
sh system_info.sh
```

```bash
#!/bin/bash
# This is a comment
echo "System Information Report"
```

- `#!/bin/bash` is the **shebang**. It tells the operating system to run the script with Bash.
- `#` starts a comment.
- `./script.sh` means run the script from the current directory. It needs execute permission.
- `bash script.sh` runs it using Bash; execute permission is not required for this form.
- `chmod +x script.sh` normally needs to be doncxe only once.

**MCQ trap:** `permission denied` for `./script.sh` often means the executable bit is missing. Use `chmod +x script.sh`.

## 3. Linux commands used inside scripts

| Purpose | Command |
|---|---|
| Current directory | `pwd` |
| Create directory | `mkdir -p directory` |
| Create file | `touch file.txt` |
| Print file | `cat file.txt` |
| Current date | `date` |
| Hostname | `hostname` |
| Current username | `whoami` |
| Disk usage | `df -h` |
| Running processes | `ps aux` |
| Show first lines | `head -15` |
| Search text | `grep text file` |
| Add execute permission | `chmod +x script.sh` |

Example log task:

```bash
mkdir -p hello
cd hello
echo "This is my logfile" > app.log
cat app.log
```

`echo ... > app.log` creates the file if needed, so a separate `touch app.log` is not necessary.

## 4. Output redirection and operators

| Symbol | Meaning | Example |
|---|---|---|
| `>` | Write output and overwrite existing content | `echo first > app.log` |
| `>>` | Append output; preserve existing content | `echo second >> app.log` |
| `<` | Give a command input from a file | `sort < names.txt` |
| `|` | Pipe output to next command | `ps aux | head -15` |
| `&&` | Run next command only if previous succeeds | `mkdir logs && cd logs` |
| `*` | Wildcard for matching non-hidden names | `cat *.log` |
| `-R` | Recursive operation | `chmod -R 755 scripts/` |

**Most important MCQ:** `>` overwrites; `>>` appends.

## 5. Variables and command substitution

```bash
#!/bin/bash
name="Kaif Molla"
roll_no="24BCS10221"
comment="Shell scripting revision"
CURRENT_DATE=$(date)
MY_HOSTNAME=$(hostname)
MY_USER=$(whoami)

echo "Name: $name"
echo "Date: $CURRENT_DATE"
echo "Host: ${MY_HOSTNAME}"
```

Rules:

- Assignment has **no spaces**: `name="Kaif"` is correct; `name = "Kaif"` is wrong.
- Read a variable with `$name` or `${name}`.
- `$(command)` saves command output into a variable. Example: `CURRENT_DATE=$(date)`.
- Quote values, especially values that may contain spaces: `"$name"`.
- Do not use a command or reserved keyword as a variable name.
- Variables created inside the script are normally available only to that script process.

**MCQ trap:** `echo $hostname` prints a variable called `hostname`; `hostname` without `$` runs the Linux command.

## 6. Read runtime input

```bash
#!/bin/bash
read -p "Enter your name: " name
read -p "Enter your roll number: " roll_no
read -p "Enter a comment: " comment

echo "My name is $name"
echo "My roll number is $roll_no"
echo "My comment is: $comment"
```

- `read` takes input while the script is running.
- `-p` displays the prompt before accepting input.
- The final word, such as `name`, is where the entered value is stored.

## 7. Arguments and special variables

Run:

```bash
./greet.sh Kaif Molla
```

| Variable | Meaning for this run |
|---|---|
| `$0` | Script name/path, e.g. `./greet.sh` |
| `$1` | First argument: `Kaif` |
| `$2` | Second argument: `Molla` |
| `$#` | Number of arguments: `2` |
| `$@` | All arguments, preserving separate arguments when quoted |
| `$?` | Exit status of previous command; `0` normally means success |

```bash
#!/bin/bash
echo "Hello, $1 $2"
echo "Argument count: $#"
```

**MCQ trap:** `$1` is the first argument; it is not the script name. `$0` is the script name.

## 8. Conditions: if, elif, else

```bash
#!/bin/bash
read -p "Enter your age: " age

if [ "$age" -lt 0 ]; then
  echo "Invalid age"
elif [ "$age" -lt 18 ]; then
  echo "Minor"
else
  echo "Adult"
fi
```

Structure: `if` → condition → `then` → true commands → optional `elif`/`else` → `fi`.

### Common test operators

| Test | Meaning |
|---|---|
| `-eq` | equal to (numbers) |
| `-ne` | not equal to |
| `-gt`, `-ge` | greater than, greater than or equal |
| `-lt`, `-le` | less than, less than or equal |
| `=` or `==` | string equal |
| `!=` | string not equal |
| `-z "$value"` | string is empty |
| `-n "$value"` | string is not empty |
| `-f file` | regular file exists |
| `-d directory` | directory exists |
| `-e path` | path exists |

Use spaces inside single brackets: `[ "$age" -gt 10 ]` is correct; `[$age -gt 10]` is wrong.

### Safer input validation from the class example

```bash
if [[ $input == "q" ]]; then
  break
elif ! [[ $input =~ ^[0-9]+$ ]]; then
  echo "Enter a valid number"
  continue
fi
```

- `break` immediately ends a loop.
- `continue` skips the remaining current iteration and starts the next one.

## 9. Loops

### for loop

```bash
for name in Kaif Molla DevOps
do
  echo "$name"
done

for i in {1..5}
do
  echo "Iteration $i"
done
```

Use a `for` loop when iterating through a known list or range.

### while loop

```bash
count=1
while [ "$count" -le 3 ]
do
  echo "$count"
  count=$((count + 1))
done
```

Use a `while` loop when repetition depends on a condition.

**MCQ trap:** `do` begins a loop body and `done` ends it. `fi` ends an if statement.

## 10. Functions

```bash
#!/bin/bash

show_info() {
  echo "Current date: $(date)"
  echo "Hostname: $(hostname)"
}

show_info
```

- A function groups reusable commands under a name.
- Define it first, then call it by writing `show_info`.
- Parentheses appear in the function definition, not in the call.

## 11. Class homework pattern: system information script

```bash
#!/bin/bash
CURRENT_DATE=$(date)
MY_HOSTNAME=$(hostname)
MY_USER=$(whoami)

echo "Current Date: $CURRENT_DATE"
echo "Hostname: $MY_HOSTNAME"
echo "Username: $MY_USER"
df -h
ps aux | head -15

read -p "Enter directory name: " DIR_NAME
read -p "Enter file name: " FILE_NAME
mkdir -p "$DIR_NAME"
ps aux > "$DIR_NAME/$FILE_NAME"
echo "Process information saved"
```

This demonstrates variables, command substitution, input, directories, redirection, process capture, and reusable automation in one answer.

## 12. Debugging patterns

| Problem | Check / fix |
|---|---|
| `permission denied` | `chmod +x script.sh`, then `./script.sh` |
| Variable prints blank | Verify the variable name, no spaces around `=`, and use `$variable`. |
| Script overwrote file | Replace `>` with `>>` if you wanted to append. |
| `if` syntax error | Check spaces in `[ condition ]`, `then`, and closing `fi`. |
| Loop does not stop | Check condition update or use `break` when appropriate. |
| Need to inspect commands as executed | Run `bash -x script.sh` for trace output. |
| Need a syntax check | Run `bash -n script.sh`; it checks syntax without running commands. |

## 13. Last-minute MCQ memory list

```text
Shell script = Linux commands + programming logic for automation
Shebang = #!/bin/bash
Comment = #
Run current script = ./script.sh
Make executable = chmod +x script.sh
Print = echo
Read input = read -p
Variable assignment has NO spaces around =
Use variable = $name; command output = $(date)
First argument = $1; script name = $0; all arguments = $@
Decision = if / elif / else / fi
Repetition = for / while / do / done
Function = name() { commands; }
> overwrites; >> appends; | pipes output
ps aux = processes; df -h = disk usage
```

## 14. Do not over-memorise today

First master shell structure, variables, input, arguments, redirection, conditions, loops, and functions. You do not need to memorise every Bash feature before the exam; understand what each command and symbol does, then practise 4–5 small scripts.
