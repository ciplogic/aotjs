Items to be done:

Makes sure that for statements are wrapped in block statements
---

Break loops like
----
- for (break& continue is missing)
- while (break& continue is missing) 
- switch 

* Breaking operators &&, || should short circuit
* break ? : as if/else

into label/gotos



break expressions into component parts
---



Optimizations
---

- Assigned once global variables should be considered constants if no calls are made. Propagate the constants in the calls
- assigned variables but not used should be deleted if assigned to constants/literals
