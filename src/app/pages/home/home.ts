import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  readonly courses = [
    {
      category: 'DESIGN',
      title: 'Design Thinking for Real Products',
      description:
        'Turn ideas into thoughtful products through practical design thinking.',
      instructor: 'AlDar Studio',
      lessons: 18
    },
    {
      category: 'DEVELOPMENT',
      title: 'Build Modern Web Applications',
      description:
        'Learn modern development through projects that feel like real work.',
      instructor: 'AlDar Tech',
      lessons: 24
    },
    {
      category: 'CAREER',
      title: 'Build a Career That Fits You',
      description:
        'Create direction, confidence, and momentum for your next chapter.',
      instructor: 'AlDar Career',
      lessons: 14
    }
  ];
}