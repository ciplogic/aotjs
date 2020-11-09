
function fact2(n)
{
    var res = n;
    while (--n > 1)
        res *= n;
    return res;
}
console.log(fact2(4))
