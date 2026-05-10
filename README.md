# about
this student management system has minimal implemenatation .ts and .tsx with a complete database system with all operation
also there is student dashborad and admin dashboard. for student and admin bith have to sign in to get their profile and see  the admin 
system respectively . also student can chnage theri user name and password(only if their name and registration no in the database).


# project structure
```
student-mgmt/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                        ← redirects to /login
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── student/
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   ├── admin/
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── register/route.ts
│   │       │   └── logout/route.ts
│   │       ├── students/
│   │       │   ├── route.ts               ← GET all, POST new
│   │       │   ├── [id]/
│   │       │   │   └── route.ts           ← GET one, PUT, 
│   │       │   └── me
│   │       │       └── route.ts
DELETE
│   │       └── grades/
│   │           ├── route.ts               ← POST new grade
│   │           └── [studentId]/
│   │               └── route.ts           ← GET by student, PUT
│   └── lib/
│       ├── db.ts                          ← DB connection singleton
│       ├── db-setup.ts                    ← Schema + seed script
│       └── auth.ts                        ← JWT helpers
├── database.sqlite                        ← auto-created by setup script
└── .env.local
```


### for run
```
npm run db:setup
and
npm run dev
```
### or
```
sqlite3 database.sqlite ".read 'path of the setup.sql file '"
and
npm run dev
```

