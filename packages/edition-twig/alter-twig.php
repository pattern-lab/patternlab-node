<?php
use Twig\Environment;
use Twig\TwigFunction;

/**
 * @param Twig_Environment $env - The Twig Environment - https://twig.symfony.com/api/1.x/Twig_Environment.html
 * @param $config - Config of `@basalt/twig-renderer`
 */
function addCustomExtension(Environment &$env, $config) {

  /**
   * @example `<h1>Hello {{ customTwigFunctionThatSaysWorld() }}!</h1>` => `<h1>Hello Custom World</h1>`
   */
//  $env->addFunction(new TwigFunction('customTwigFunctionThatSaysWorld', function () {
//    return 'Custom World';
//  }));

  /*
   * Reverse a string
   * @param string $theString
   * @example `<p>{{ reverse('abc') }}</p>` => `<p>cba</p>`
   */
//  $env->addFunction(new TwigFunction('reverse', function ($theString) {
//    return strrev($theString);
//  }));


//  $env->addExtension(new \My\CustomExtension());

//  `{{ foo }}` => `bar`
//  $env->addGlobal('foo', 'bar');

  // example of enabling the Twig debug mode extension (ex. {{ dump(my_variable) }} to check out the template's available data) -- comment out to disable
  // $env->addExtension(new Twig\Extension\DebugExtension());
}
