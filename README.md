# Akkeris Redis CLI Plugin

Backup and restore redis instances and get statistics.

## Installation

```bash
aka plugins:install redis
```

## Statistics

Pull statistics related to a redis:

```bash
aka redis:stats -a [appname-space]
```

## Backups and Restores

### List Backups

```bash
aka redis:backups -a [appname-space]
```

### Create Backup

```bash
aka redis:backups:create -a [appname-space]
```

### Get Backup Information

```bash
aka redis:backups:info BACKUP_ID -a [appname-space]
```

### Restore a Backup

```bash
aka redis:backups:restore BACKUP_ID -a [appname-space]
```
