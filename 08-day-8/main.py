#Simple Function
def greet():
    print("Hello Angela")
    print("How do you do Jack Bauer?")
    print("Isn't the weather nice today?")
greet()

#Function that allows for input

def greet_with_name(name):
    print(f"Hello {name}")
    print(f"How do you do {name}")

greet_with_name("Daniel")

#Functions with more than 1 input
def greet_with(name, location):
    print(f"Hello {name}")
    print(f"What is it like in {location}?")

greet_with("Jack Bauer", "Nowhere")

#Functions with keywod arguments
greet_with(location="London", name="Angel")