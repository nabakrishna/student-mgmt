# about
this student management system has minimal implemenatation .ts and .tsx with a complete database system with all operation
also there is student dashborad and admin dashboard. for student and admin bith have to sign in to get their profile and see  the admin 
system respectively . also student can chnage theri user name and password(only if their name and registration no in the database).


# project structure
```
student-mgmt/
├── .next                                   ← .next js modules
├── node-modules                            ← node modules
├── public/...                              ← 
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
│       ├── setup.sql                      ← DB script
│       ├── db-setup.ts                    ← Schema + seed script
│       └── auth.ts                        ← JWT helpers
├── database.sqlite                        ← auto-created by setup script
├── .env.local
├── .gitignore
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```
# for setup instruction

#### 1. Scaffold a new Next.js project
```
npx create-next-app@latest student-mgmt --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd student-mgmt
```
#### 2. Install SQLite drivers
```
npm install sqlite sqlite3
```
#### 3. Install auth dependencies (JWT + password hashing)
```
npm install jsonwebtoken bcryptjs
npm install --save-dev @types/jsonwebtoken @types/bcryptjs @types/node
```
#### 4. Install tsx to run the setup script directly
```
npm install --save-dev tsx
```

## add this script to package.json
```
"scripts": {
  "db:setup": "tsx src/lib/db-setup.ts"
}
```

## for run
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

