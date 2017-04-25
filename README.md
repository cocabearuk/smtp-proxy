# smtp-proxy

Utility to forward or suppress emails; useful when dealing with Jira to stop automated signup emails for their service desk, but allow other communications through.

Only lightly tested via SMTP, but worked originally with Jira (on-prem):

```
> telnet o localhost 28
> EHLO HOSTNAME
> AUTH LOGIN
> bWU=
> Y3VwMGZ0M0BmQHRoM3I=
> MAIL FROM:<someonesemail@overthere.com>
> RCPT TO:<overthere@please.com>
> DATA
> Some sample data
> .
>
...
```
