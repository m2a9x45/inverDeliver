# Food Delivery Project

A personal project with an online store, with product data scapped from UK supermarkets. Along with some delivery tooling.

A marketplace solution to food deliver food from supermarkets and the like. Currently I've started the backend with two routes one to list all the products, which in the future will turning a site wide reccomendation endpoint.

The other route is a search using the LIKE syntax in SQL to return a list of products where the name includes the search term. 

A .env file is needed to give creds to the database :

```
DB_HOST=[HOSTNAME]
DB_USER=[DATABASE_USERNAME]
DB_PASS=[DATABASE_USER_PASSWORD]
DB_DB=[DATABASE_NAME]
```

And a backend/public/productImage directory is used to host the product images.