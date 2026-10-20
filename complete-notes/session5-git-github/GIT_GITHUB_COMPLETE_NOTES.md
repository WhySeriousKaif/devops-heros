# Git & GitHub — Complete Beginner Notes

These are Session 5 learning notes based on the class transcript, homework, and resources. They are written to explain the full context first, then the commands and likely exam questions.

## 1. Why Git and GitHub exist

Software changes constantly. Developers need to know what changed, who changed it, why it changed, and how to safely work on different changes at the same time.

- **Git** is a version-control tool installed on your computer. It tracks changes in a project folder.
- **GitHub** is an online platform that hosts Git repositories so people can back them up, share them, collaborate, review code, and run automation such as GitHub Actions.
- A **repository** (repo) is the project plus its Git history.

Simple example: you change `app.py`, test it, save a named checkpoint called a **commit**, and push it to GitHub. Later, you can inspect or restore that history.

---

## 2. Git workflow: the four places to understand

```text
Working directory  →  Staging area  →  Local repository  →  Remote repository (GitHub)
     edit files          git add          git commit             git push
```

### 1. Working directory

This is the actual project folder where you create, edit, and delete files.

### 2. Staging area (index)

This is a selection area. `git add` chooses exactly which changes will go into the next commit.

### 3. Local repository

This is the Git history stored on your own computer inside the hidden `.git` folder. `git commit` saves a checkpoint here.

### 4. Remote repository

This is the copy hosted on GitHub. `git push` sends local commits there; `git pull` brings and integrates remote changes locally.

**Memory sentence:** edit → add → commit → push.

---

## 3. First-time repository setup

### Start a brand-new local project

```bash
mkdir my-project
cd my-project
git init
git status
```

`git init` creates the hidden `.git` folder and turns the current folder into a Git repository.

### Copy an existing GitHub project

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd REPOSITORY
git status
```

`git clone` downloads the project files, full Git history, and its remote connection.

### Identify yourself for commits

```bash
git config --global user.name "MD Kaif Molla"
git config --global user.email "your-email@example.com"
git config --list
```

Git records this identity in commits. Use the email connected to your GitHub account if you want GitHub to attribute commits correctly.

---

## 4. Everyday commands

| Command | What it does |
|---|---|
| `git status` | Shows branch, changed files, staged files, and untracked files. Use this first and often. |
| `git add file.txt` | Stages one file. |
| `git add .` | Stages all relevant changes under current directory. Review `git status` before committing. |
| `git commit -m "message"` | Saves staged changes as a local commit. |
| `git log --oneline` | Shows compact commit history. |
| `git diff` | Shows unstaged changes. |
| `git diff --staged` | Shows what is staged for the next commit. |
| `git push origin main` | Sends local `main` commits to GitHub. |
| `git pull origin main` | Fetches and integrates remote `main` changes into local branch. |

### Normal safe workflow

```bash
git status
git add README.md
git diff --staged
git commit -m "docs: update README"
git push origin main
```

A good commit message explains the change, not merely the filename. xExamples:

```text
feat: add login validation
fix: handle empty user input
docs: update setup instructions
```

---

## 5. Tracked versus untracked files

- An **untracked** file is new and Git has never been told to include it.
- A **tracked** file was added in an earlier commit. Git now notices future modifications and deletion.

```bash
git status -s
```

Common short-status symbols:

| Symbol | Meaning |
|---|---|
| `?? file.txt` | New/untracked file. |
| ` M file.txt` | Modified in working directory but not staged. |
| `M  file.txt` | Modified and staged. |
| `A  file.txt` | New file staged for commit. |
| `D  file.txt` | Deletion staged. |

---

## 6. `git commit -m` versus `git commit -a -m`

```bash
git commit -m "save selected staged files"
git commit -a -m "save all modified tracked files"
```

| Behaviour | `git commit -m` | `git commit -a -m` / `-am` |
|---|---|---|
| Modified tracked file | Must be staged first with `git add` | Automatically stages and commits it |
| Deleted tracked file | Must be staged first | Automatically stages and commits it |
| New untracked file | Must be added first | Still ignored; must be added first |
| Select exact files | Yes | No; includes all modified tracked files |

**Most important MCQ:** `git commit -a -m` does **not** add brand-new untracked files.

---

## 7. Branches

A branch is an independent line of development. It lets you work on a feature or fix without changing the stable `main` branch directly.

```text
main:     A ─── B ─── C
                   \
feature:            D ─── E
```

Here, feature work happens at D and E while main remains stable at C.

```bash
git branch                       # list local branches; * marks current branch
git switch -c feature-login      # create and switch to new branch
git switch main                  # switch to existing branch
git checkout -b feature-login    # older equivalent of switch -c
git branch -d feature-login      # delete merged branch
git branch -D feature-login      # force delete branch; use carefully
```

Typical feature workflow:

```bash
git switch -c feature-login
# edit files
git add .
git commit -m "feat: add login page"
git push -u origin feature-login
```

The `-u` sets the upstream connection, so later `git push` and `git pull` can work without repeatedly writing branch names.

---

## 8. Remote, origin, push, fetch, and pull

A **remote** is a named link to another repository. GitHub's remote is usually named `origin`.

```bash
git remote -v
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

### Fetch versus pull

| Command | What it does to local files/current branch |
|---|---|
| `git fetch origin` | Downloads remote commits and updates remote-tracking information. It does **not** change your working files or current branch. |
| `git pull origin main` | Fetches, then integrates the remote branch into your current local branch. It may merge or rebase depending on configuration. |

**MCQ answer:** `fetch` downloads knowledge of remote changes; `pull` downloads **and integrates** them.

Before starting work on a shared branch:

```bash
git switch main
git pull origin main
```

Pull can cause a merge conflict if your local uncommitted or committed changes conflict with incoming changes. It does not simply “overwrite everything.”

---

## 9. Merging branches

To merge a feature branch **into main**, first switch to the destination branch (`main`), then name the source branch (`feature-login`).

```bash
git switch main
git pull origin main
git merge feature-login
git push origin main
```

Possible outcomes:

- **Fast-forward merge:** main has not moved since the feature branch began, so Git can move main forward.
- **Merge commit:** both branches have separate commits; Git creates a commit joining the histories.
- **Merge conflict:** Git cannot decide how to combine overlapping changes.

---

## 10. Merge conflicts

A merge conflict usually happens when two branches change the same lines in the same file differently.

Conflict markers look like this:

```text
&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
Version currently in your branch
&equals;&equals;&equals;&equals;&equals;&equals;&equals;
Version coming from the branch being merged
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature-login
```

### How to resolve a conflict

1. Run `git status` to see the conflicting file.
2. Open that file and read both versions.
3. Decide whether to keep one version or combine them.
4. Remove all conflict-marker lines: `<<<<<<<`, `=======`, `>>>>>>>`.
5. Test the file/application.
6. Stage and commit the resolution.

```bash
git status
# edit the conflict file
git add conflicted-file.md
git commit -m "fix: resolve merge conflict"
git push origin main
```

To abandon a merge that is currently in conflict:

```bash
git merge --abort
```

---

## 11. Inspecting changes

```bash
git log --oneline -n 5
git show COMMIT_HASH
git diff
git diff --staged
git diff COMMIT_HASH_1 COMMIT_HASH_2
```

- `git log --oneline` is the quickest way to find short commit hashes.
- `git diff` uses `-` for removed lines and `+` for added lines.
- Use `git show <hash>` when you want to inspect one particular commit.

---

## 12. Undo safely: restore, reset, revert

These commands are easy to confuse. Read the scope before using one.

### `git restore`

Use it to discard unwanted working-directory changes in a tracked file.

```bash
git restore file.txt
```

This replaces local uncommitted changes in `file.txt` with the version from the current commit. Those discarded edits are difficult to recover.

### `git reset`

Use `git reset file.txt` to unstage a file while keeping the actual file edits.

```bash
git add file.txt
git reset file.txt
```

Result: the file moves from staging area back to modified working-directory state.

### `git revert`

Use revert for a commit that has already been shared/pushed. It creates a **new** commit that reverses the old commit.

```bash
git revert COMMIT_HASH
```

**Safe rule:** for shared/public history, prefer `git revert`; avoid rewriting it with destructive reset commands.

---

## 13. Rebase and merge

Both merge and rebase bring one branch's work together with another branch, but they create different history shapes.

### Merge

```bash
git switch main
git merge feature-login
```

Merge preserves the existing branch history and may create a merge commit. It is straightforward and safe for shared branches.

### Rebase

```bash
git switch feature-login
git rebase main
```

Rebase takes the feature branch's commits and replays them on top of the latest `main`, producing a linear-looking history.

Important: rebased commits receive **new commit hashes** because their parent/history changes. Do not rebase commits that other people have already based work on unless your team explicitly agrees.

### Quick comparison

| Need | Better choice |
|---|---|
| Preserve true branch history / collaborate safely | Merge |
| Update your own local feature branch to appear on top of current main | Rebase |
| Take one specific commit only | Cherry-pick |

---

## 14. Cherry-pick

`git cherry-pick COMMIT_HASH` copies the changes introduced by one selected commit onto your current branch. It creates a new commit with a new hash.

Use case: a feature branch contains unfinished work plus one urgent bug fix. Production/main needs only the bug fix.

```bash
git switch feature-branch
git log --oneline
# Copy the required fix hash

git switch main
git cherry-pick c167c6f
git log --oneline -n 5
```

If a cherry-pick conflicts:

```bash
# resolve file conflicts, then:
git add RESOLVED_FILE
git cherry-pick --continue

# or abandon the operation:
git cherry-pick --abort
```

**MCQ difference:** cherry-pick takes one selected commit; rebase reapplies a sequence of commits; merge combines branch histories.

---

## 15. `.gitignore`

`.gitignore` tells Git which untracked files it should ignore. It prevents accidental addition of generated files, local secrets, logs, or dependencies.

Example:

```gitignore
.env
*.log
node_modules/
__pycache__/
.DS_Store
```

Important: `.gitignore` does not automatically stop tracking a file that was already committed. Remove it from Git's index first if needed:

```bash
git rm --cached FILE
```

Never commit passwords, private keys, API tokens, or `.env` secrets.

---

## 16. Complete practical flow

### Existing project: make and push one safe change

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd REPOSITORY
git switch main
git pull origin main

# edit a file
git status
git add README.md
git diff --staged
git commit -m "docs: improve README"
git push origin main
```

### Feature branch: work safely

```bash
git switch main
git pull origin main
git switch -c feature-example

# edit and test
git add .
git commit -m "feat: add example feature"
git push -u origin feature-example
```

On GitHub, open a Pull Request to request review and merge into main. In a real DevOps workflow, a pull request can trigger CI tests before the merge is allowed.

---

## 17. Exam-style questions with answers

### Q1. What is the difference between Git and GitHub?

**Answer:** Git is the version-control system running locally; GitHub is an online platform that hosts Git repositories and supports collaboration, pull requests, and automation.

### Q2. What is the normal Git workflow?

**Answer:** Edit in working directory → `git add` to staging area → `git commit` to local repository → `git push` to remote/GitHub.

### Q3. What does `git status` show?

**Answer:** The current branch and the state of files, including untracked, modified, staged, and ready-to-commit changes.

### Q4. Difference between `git commit -m` and `git commit -a -m`?

**Answer:** `git commit -m` commits only already staged changes. `git commit -a -m` automatically stages modified/deleted tracked files but does not include new untracked files.

### Q5. What is a branch?

**Answer:** An independent line of development used to work on a feature or fix without directly changing main.

### Q6. Difference between `git fetch` and `git pull`?

**Answer:** Fetch downloads remote changes without changing current working files; pull fetches and integrates remote changes into the current branch.

### Q7. How do you merge `feature-login` into `main`?

**Answer:** `git switch main`, then `git merge feature-login`.

### Q8. What creates a merge conflict?

**Answer:** Usually two branches change the same lines of the same file differently, and Git cannot choose the intended combined version.

### Q9. How do you resolve a merge conflict?

**Answer:** Edit the conflicted file, choose/merge correct content, remove conflict markers, test, then `git add` and `git commit`.

### Q10. What does `git reset file.txt` do after `git add file.txt`?

**Answer:** It unstages the file but preserves its working-directory edits.

### Q11. What is cherry-pick used for?

**Answer:** To apply one selected commit from another branch onto the current branch, commonly for an urgent hotfix.

### Q12. Merge versus rebase?

**Answer:** Merge combines histories and may create a merge commit. Rebase replays commits on a new base and creates new commit hashes for a cleaner linear history.

---

## 18. Final memory map

```text
Git = local version control; GitHub = online hosting/collaboration
edit → add → commit → push
git status = see what is happening
git add = staging area
git commit = local checkpoint
git push = send commits to GitHub
git clone = copy existing remote repo
git branch / switch = separate work
git fetch = download remote information only
git pull = fetch + integrate
git merge = combine branch history
git rebase = replay commits on new base
git cherry-pick = copy one selected commit
git reset file = unstage, keep edits
git restore file = discard uncommitted tracked-file edits
git revert hash = safely reverse a shared commit with a new commit
```
