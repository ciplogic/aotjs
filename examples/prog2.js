

function fact3(n)
{
    function inner(res,n)
    {
        if (n < 2)
            return res;
        else
            return inner(res*n, n-1);
    }
    return inner(1,n);
}

var cnt = 0;
++cnt;

console.log("fact3", fact3(100));
