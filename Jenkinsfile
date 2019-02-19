pipeline {
  agent {
    node {
      label 'c3'
    }

  }
  stages {
    stage('Build') {
      steps {
        git(url: 'git@github.com:paulomenezes/c3.git', branch: 'master')
      }
    }
    stage('') {
      steps {
        sh 'npm install'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
  }
}