db.createUser(
    {
        user: "org1admin",
        pwd: "org1adminpw",
        roles: [
            {
                role: "readWrite",
                db: "reporting"
            }
        ]
    }
)
