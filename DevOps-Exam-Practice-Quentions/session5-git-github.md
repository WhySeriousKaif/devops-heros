# MCQs — session5-git-github

**10 multiple-choice questions | 1 mark each | Answer key at the end**

### Q1. Which command initializes a local Git repository?

A. git init
B. git boot
C. git create
D. git start

### Q2. Which command stages a file for commit?

A. git fetch
B. git log
C. git add
D. git push

### Q3. Which command records staged changes?

A. git status
B. git diff
C. git commit
D. git clone

### Q4. Which command shows the current working tree state?

A. git status
B. git branch -d
C. git gc
D. git tag -d

### Q5. Which command creates a new branch?

A. git reset feature
B. git branch feature
C. git commit feature
D. git push feature

### Q6. Which command integrates another branch into the current branch?

A. git fetch
B. git clean
C. git merge
D. git stash

### Q7. What does git clone do?

A. Deletes a remote branch
B. Reverts the operating system
C. Renames a commit
D. Copies a repository to a local directory

### Q8. What is a pull request typically used for?

A. Building a Docker layer
B. Starting a Kubernetes pod
C. Reviewing and discussing changes before merge
D. Provisioning a VPC

### Q9. What does .gitignore control?

A. Which untracked paths Git should ignore
B. Who can access GitHub
C. The commit author
D. The default remote URL

### Q10. Which command uploads local commits to a remote?

A. git diff
B. git pull
C. git push
D. git show

---

## Answer Key

1-A, 2-C, 3-C, 4-A, 5-B, 6-C, 7-D, 8-C, 9-A, 10-C

---

## Practical / Lab Questions (Exam Style)

**Suggested format:** Complete the task in the relevant lab environment, submit commands/configuration files, and include brief evidence of verification. Do not hard-code credentials.

### Lab 1
Create a Git repository for a small application, add a README, make at least three meaningful commits, and push it to GitHub.

### Lab 2
Create a feature branch, implement a change, push the branch, and merge it into main through a Pull Request after reviewing the diff.

### Lab 3
Create a merge conflict by editing the same line on two branches. Resolve it, commit the resolution, and verify the final history.


---

## Kaif’s revision help — why the answers are correct

| Question | Correct answer | Why |
|---|---|---|
| Q1 | A | `git init` creates a new local Git repository. |
| Q2 | C | `git add` stages a file for the next commit. |
| Q3 | C | `git commit` records staged changes in local history. |
| Q4 | A | `git status` reports branch and working-tree/staging state. |
| Q5 | B | `git branch feature` creates a branch; `git switch -c feature` creates and enters one. |
| Q6 | C | `git merge` integrates another branch into the current branch. |
| Q7 | D | `git clone` copies a remote repository and its history locally. |
| Q8 | C | A pull request enables review/discussion before a merge. |
| Q9 | A | `.gitignore` specifies untracked paths Git should ignore. |
| Q10 | C | `git push` uploads local commits to a remote. |

### Practical-lab answer approach

```bash
git init
echo "# Exam App" > README.md
git add README.md && git commit -m "docs: add README"
# Make two more small, meaningful commits
git log --oneline
```

Feature branch flow:

```bash
git switch -c feature-example
# edit a file
git add . && git commit -m "feat: add example"
git push -u origin feature-example
```

For a merge conflict: modify the same line differently in `main` and feature branch, commit both, then merge. Edit the conflict markers away, test, `git add`, then `git commit`. Remember: edit → add → commit → push.
