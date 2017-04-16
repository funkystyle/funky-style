git add .
echo "Please enter comment: "
read input_variable
git commit -m "$input_variable"
git push origin master