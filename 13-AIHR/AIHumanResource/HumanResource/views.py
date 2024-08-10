from django.shortcuts import render, HttpResponse
from django.views import View

# Create your views here.
def home(request):
    return render(request, 'app/hr_dashboard.html')

class NewJob(View):
    
    def get(self, request):
        return render(request, 'app/new_job.html')

