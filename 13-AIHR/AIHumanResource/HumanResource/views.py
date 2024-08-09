from django.shortcuts import render, HttpResponse

# Create your views here.
def home(request):
    return HttpResponse('This is the home page')

def about(request):
    return HttpResponse('This is the about page')

def services(request):
    return HttpResponse('This is the services page')
