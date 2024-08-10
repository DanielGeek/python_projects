import datetime
from django.shortcuts import redirect, render, HttpResponse
from django.views import View
from django.contrib import messages
from .models import Job

# Create your views here.
def home(request):
    jobs = Job.objects.all()

    job_data = {}

    for j in jobs:
        lower_bound = j.salary * 0.9
        upper_bound = j.salary * 1.1
        posted = (datetime.datetime.today().date() - j.date_posted).days

        job_data[j.id] = {
            'job': j,
            'lower_bound': lower_bound,
            'upper_bound': upper_bound,
            'posted': posted
        }
    
    return render(request, 'app/hr_dashboard.html', {'job_data': job_data})

class NewJob(View):
    
    def get(self, request):
        return render(request, 'app/new_job.html')
    
    def post(self, request):
        job_title = request.POST.get('jobTitle')
        department = request.POST.get('department')
        salary = request.POST.get('salary')
        location = request.POST.get('location')
        introduction = request.POST.get('introduction')
        description = request.POST.get('description')
        responsabilities = request.POST.get('responsabilities')
        qualifications = request.POST.get('qualifications')

        print('Job Title:', job_title)
        print('Department:', department)
        print('Salary:', salary)
        print('Location:', location)
        print('Introduction:', introduction)
        print('Description:', description)
        print('Responsabilities:', responsabilities)
        print('Qualifications:', qualifications)

        if job_title:
            if department:
                if salary != '' and int(salary) > 0:
                    if location:
                        if introduction:
                            if description:
                              if responsabilities:
                                  if qualifications:
                                      # Add job to database

                                      new_job = Job.objects.create(job_title=job_title, department=department,
                                                                     salary=salary, location=location,
                                                                     introduction=introduction,
                                                                     brief_posting_description=description,
                                                                     responsabilities=responsabilities,
                                                                     qualifications=qualifications)
                                      new_job.save()
                                      messages.success(request, 'Job added successfully')
                                      return redirect('home')
                                  else:
                                      messages.warning(request, 'Qualifications is required')
                              else:
                                  messages.warning(request, 'Responsabilities is required')
                            else:
                                messages.warning(request, 'Description is required')
            else:
                messages.warning(request, 'Department is required')
        else:
            messages.warning(request, 'Job Title is required')

        return render(request, 'app/new_job.html')

