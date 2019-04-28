## Interactive Graphics - 2019 - HW1

><u>Student</u>: Ion Tataru;
><u>Student ID</u>: 1595331;



### Task 1

Add the viewer position (your choice), a projection (your choice) and compute the ModelView and Projection matrices in the JavaScript application. The viewer position and viewing volume should be controllable with buttons, sliders or menus.

#### Solution T1

The viewer position related to the  `eye` position expressed in polar coordinates, that is controlled by the *user* with the:

-   `radius`   -  the distance from the origin;
-   `theta`  and  `phi`  angles  -  characterize the degree of obliqueness;



The viewer volume is controlled by the following parameters:

-   <u>Orthographic Projection</u> case:   `right`, `left`, `top`, `bottom`, `near`, `far`. 
    -    ![1556478192304](C:\Users\ivanf\AppData\Roaming\Typora\typora-user-images\1556478192304.png)
    -   The Orthographic Projection Matrix is computed as following:
         `projectionMatrix  =  ortho(left, right, bottom, top, zNear, zFar);`  
    -   
-   

### Task 2

Include a scaling (uniform, all parameters have the same value) and a translation Matrix and control them with sliders.

#### Solution T2

>   TODO . . .





### Task 3

Define an orthographic projection with the planes near and far controlled by sliders.

#### Solution T3

>   TODO . . .





#### Task 4

Split the window vertically into two parts. One shows the orthographic projection defined above, the second uses a perspective projection. The slider for near and far should work for both projections. Points 5 to 7 use the splitted window with two different projections.

#### Solution T4

>   TODO . . .







### Task 5

Introduce a light source, replace the colors by the properties of the material (your choice) and assign to each vertex a normal.

#### Solution T5

>   TODO . . .







### Task 6

Implement both the Gouraud and the Phong shading models, with a button switching between them.

#### Solution T6

>   TODO . . .






### Task 7

Add a procedural texture (your choice) on each face, with the pixel color a combination of the color computed using the lighting model and the texture.

#### Solution T7

>   TODO . . .
