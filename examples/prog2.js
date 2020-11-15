function fact(n)
{
    if (n <= 2)
        return n;
    else
        return n*fact(n-1);
}

console.log("fact", fact(100));
