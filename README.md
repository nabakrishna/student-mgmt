# about
In this student management system, the front end is craeted using typescript/tsx along with the simple sql database and also the database in the .ts script. This management system has separate dashboards for both students and administrators, and each login must be authenticated to view any profile or management interface. In addition to providing all CRUD actions, there is an added security feature whereby students have to validate their name and registration number to update their password information.

## Deplyoment

I deployed in render by changing some files and code.<br>
for see the render deployed repository follow the link-<br>
https://github.com/nabakrishnaaa/student-mgmt<br>
The website live on-<br>
https://student-mgmt-vqo1.onrender.com

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
│   ├── lib/
│   │   ├── auth-edge.ts
│   │   ├── rate-limit.ts
│   │   ├── db.ts                          ← DB connection singleton
│   │   ├── setup.sql                      ← DB script
│   │   ├── db-setup.ts                    ← Schema + seed script
│   │   └── auth.ts                        ← JWT helpers
│   └── middleware.ts                      ←   
├── database.sqlite                        ← auto-created by setup script
├── .env.local
├── .gitattributes
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
## next thing to do -
1. No middleware route protection — if someone types /admin/dashboard directly in the browser without logging in, there's nothing stopping them. You only check auth inside the page after it loads, not before.
2. Admin can access student routes and vice versa — a logged-in student could manually visit /admin/dashboard and see the page flash before the client-side redirect kicks in.
3. Password hash exposed to client — your GET /api/students returns password_hash to the browser. Even hashed, this should never leave the server.
4. No rate limiting on login 
5. Filter doesn't reset — if you filter by class "12" then clear the input, the list doesn't refresh until you click Filter again.
6. No input length limits — the register and add student forms accept unlimited length input, which could cause DB issues
7. Marks validation only on DB side — the frontend lets you type -5 or 150 in the marks field with no client-side check.
8. Grade edit doesn't validate empty subject — you can save a grade with a blank subject name.
9. Selected student panel doesn't update after editing — after saving student changes, the left list refreshes but the right panel still shows old data.
10. No 404 page 
11. Register page doesn't validate password strength — accepts single character passwords.
